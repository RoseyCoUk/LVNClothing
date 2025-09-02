import React, { useState, useEffect, useCallback } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  X,
  Bell,
  Settings,
  Database,
  Shield,
  Activity
} from 'lucide-react';

interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  lastSyncStatus: 'success' | 'failed' | 'pending' | 'unknown';
  syncProgress: number;
  isSyncing: boolean;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  errorCount: number;
  warningCount: number;
  inventoryChanges: number;
  dataConflicts: number;
}

interface SyncError {
  id: string;
  timestamp: string;
  type: 'connection' | 'inventory' | 'data' | 'webhook' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  resolved: boolean;
}

interface InventoryChange {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  changeType: 'stock_update' | 'price_change' | 'availability_change' | 'new_variant';
  oldValue?: string | number;
  newValue?: string | number;
  processed: boolean;
}

interface DataConflict {
  id: string;
  timestamp: string;
  productId: string;
  conflictType: 'price_mismatch' | 'inventory_mismatch' | 'variant_mismatch' | 'data_corruption';
  printfulData: any;
  localData: any;
  resolution: 'auto_resolved' | 'manual_review' | 'pending' | 'resolved';
  autoResolution?: string;
}

interface PrintfulSyncMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintfulSyncMonitor: React.FC<PrintfulSyncMonitorProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    triggerPrintfulSync,
    getPrintfulSyncStatus,
    getSyncErrors,
    getInventoryChanges,
    getDataConflicts,
    resolveDataConflict,
    markErrorResolved,
    markInventoryChangeProcessed
  } = useAdminProducts();

  // State management
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    lastSyncStatus: 'unknown',
    syncProgress: 0,
    isSyncing: false,
    connectionHealth: 'disconnected',
    errorCount: 0,
    warningCount: 0,
    inventoryChanges: 0,
    dataConflicts: 0
  });
  
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);
  const [inventoryChanges, setInventoryChanges] = useState<InventoryChange[]>([]);
  const [dataConflicts, setDataConflicts] = useState<DataConflict[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    read: boolean;
  }>>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'errors' | 'inventory' | 'conflicts' | 'settings'>('dashboard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadSyncData();
      startAutoRefresh();
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [isOpen]);

  // Auto-refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSyncData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    // Clear any existing intervals
  }, []);

  // Load sync data
  const loadSyncData = async () => {
    try {
      // Load sync status
      const status = await getPrintfulSyncStatus();
      setSyncStatus(status);
      
      // Load sync errors
      const errors = await getSyncErrors();
      setSyncErrors(errors);
      
      // Load inventory changes
      const changes = await getInventoryChanges();
      setInventoryChanges(changes);
      
      // Load data conflicts
      const conflicts = await getDataConflicts();
      setDataConflicts(conflicts);
      
      // Update notification counts
      updateNotifications(status, errors, changes, conflicts);
      
    } catch (error) {
      console.error('Failed to load sync data:', error);
      addNotification('error', 'Failed to load sync data');
    }
  };

  // Update notifications based on current status
  const updateNotifications = (status: SyncStatus, errors: SyncError[], changes: InventoryChange[], conflicts: DataConflict[]) => {
    const newNotifications: Array<{
      id: string;
      type: 'success' | 'warning' | 'error' | 'info';
      message: string;
      timestamp: string;
      read: boolean;
    }> = [];

    // Connection status notifications
    if (!status.isConnected) {
      newNotifications.push({
        id: `conn-${Date.now()}`,
        type: 'error',
        message: 'Printful connection lost',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Sync error notifications
    if (status.errorCount > 0) {
      newNotifications.push({
        id: `error-${Date.now()}`,
        type: 'error',
        message: `${status.errorCount} sync error(s) detected`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Inventory change notifications
    if (status.inventoryChanges > 0) {
      newNotifications.push({
        id: `inventory-${Date.now()}`,
        type: 'info',
        message: `${status.inventoryChanges} inventory change(s) detected`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Data conflict notifications
    if (status.dataConflicts > 0) {
      newNotifications.push({
        id: `conflict-${Date.now()}`,
        type: 'warning',
        message: `${status.dataConflicts} data conflict(s) detected`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Add new notifications
    setNotifications(prev => [...newNotifications, ...prev]);
  };

  // Add notification
  const addNotification = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  // Mark notification as read
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Manual sync trigger
  const handleManualSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));
      
      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncStatus(prev => ({
          ...prev,
          syncProgress: Math.min(prev.syncProgress + 10, 90)
        }));
      }, 500);

      // Trigger sync
      await triggerPrintfulSync();
      
      clearInterval(progressInterval);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        syncProgress: 100,
        lastSync: new Date().toISOString(),
        lastSyncStatus: 'success'
      }));
      
      addNotification('success', 'Manual sync completed successfully');
      
      // Refresh data after sync
      setTimeout(() => {
        loadSyncData();
      }, 1000);
      
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        syncProgress: 0,
        lastSyncStatus: 'failed'
      }));
      
      addNotification('error', 'Manual sync failed');
    }
  };

  // Resolve data conflict
  const handleResolveConflict = async (conflictId: string, resolution: 'accept_printful' | 'accept_local' | 'manual') => {
    try {
      await resolveDataConflict(conflictId, resolution);
      
      // Refresh conflicts
      const conflicts = await getDataConflicts();
      setDataConflicts(conflicts);
      
      addNotification('success', 'Data conflict resolved successfully');
      
    } catch (error) {
      addNotification('error', 'Failed to resolve data conflict');
    }
  };

  // Mark error as resolved
  const handleMarkErrorResolved = async (errorId: string) => {
    try {
      await markErrorResolved(errorId);
      
      // Refresh errors
      const errors = await getSyncErrors();
      setSyncErrors(errors);
      
      addNotification('success', 'Error marked as resolved');
      
    } catch (error) {
      addNotification('error', 'Failed to mark error as resolved');
    }
  };

  // Mark inventory change as processed
  const handleMarkChangeProcessed = async (changeId: string) => {
    try {
      await markInventoryChangeProcessed(changeId);
      
      // Refresh changes
      const changes = await getInventoryChanges();
      setInventoryChanges(changes);
      
      addNotification('success', 'Inventory change marked as processed');
      
    } catch (error) {
      addNotification('error', 'Failed to mark change as processed');
    }
  };

  // Get connection health color
  const getConnectionHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'poor': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-orange-800 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-blue-800 bg-blue-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Printful Sync Monitor
                  </h3>
                </div>
                
                {/* Connection Status */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getConnectionHealthColor(syncStatus.connectionHealth)}`}>
                  {syncStatus.isConnected ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  <span className="capitalize">{syncStatus.connectionHealth}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <div className="relative">
                  <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: Activity },
                { key: 'errors', label: 'Errors', icon: AlertCircle },
                { key: 'inventory', label: 'Inventory', icon: Package },
                { key: 'conflicts', label: 'Conflicts', icon: Shield },
                { key: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Sync Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Connection Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {syncStatus.isConnected ? (
                          <Wifi className="h-8 w-8 text-green-600" />
                        ) : (
                          <WifiOff className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Connection</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Last Sync</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {syncStatus.lastSync 
                            ? new Date(syncStatus.lastSync).toLocaleTimeString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Count */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Errors</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {syncStatus.errorCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Changes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Changes</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {syncStatus.inventoryChanges}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Sync Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Manual Sync</h4>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
                      </label>
                      <button
                        onClick={loadSyncData}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleManualSync}
                      disabled={syncStatus.isSyncing}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {syncStatus.isSyncing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Syncing... {syncStatus.syncProgress}%
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Trigger Manual Sync
                        </>
                      )}
                    </button>
                    
                    {syncStatus.isSyncing && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${syncStatus.syncProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                  
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {notification.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                          
                          <span className={`text-sm ${
                            notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                          }`}>
                            {notification.message}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markNotificationRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Sync Errors</h4>
                  <span className="text-sm text-gray-500">
                    {syncErrors.length} error(s)
                  </span>
                </div>
                
                {syncErrors.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">No sync errors detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {syncErrors.map((error) => (
                      <div key={error.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(error.severity)}`}>
                                {error.severity.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {error.type.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(error.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {error.message}
                            </p>
                            
                            {error.details && (
                              <p className="text-sm text-gray-600">{error.details}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!error.resolved && (
                              <button
                                onClick={() => handleMarkErrorResolved(error.id)}
                                className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 border border-green-200 rounded hover:bg-green-200"
                              >
                                Mark Resolved
                              </button>
                            )}
                            
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              error.resolved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {error.resolved ? 'Resolved' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Inventory Changes</h4>
                  <span className="text-sm text-gray-500">
                    {inventoryChanges.length} change(s)
                  </span>
                </div>
                
                {inventoryChanges.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No inventory changes detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventoryChanges.map((change) => (
                      <div key={change.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm text-gray-500">
                                {change.changeType.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(change.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {change.productName} - {change.variantName}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {change.oldValue && (
                                <span>
                                  Old: <span className="font-medium">{change.oldValue}</span>
                                </span>
                              )}
                              {change.newValue && (
                                <span>
                                  New: <span className="font-medium">{change.newValue}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!change.processed && (
                              <button
                                onClick={() => handleMarkChangeProcessed(change.id)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200"
                              >
                                Mark Processed
                              </button>
                            )}
                            
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              change.processed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {change.processed ? 'Processed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conflicts Tab */}
            {activeTab === 'conflicts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Data Conflicts</h4>
                  <span className="text-sm text-gray-500">
                    {dataConflicts.length} conflict(s)
                  </span>
                </div>
                
                {dataConflicts.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">No data conflicts detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dataConflicts.map((conflict) => (
                      <div key={conflict.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">
                                {conflict.conflictType.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(conflict.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              conflict.resolution === 'resolved' 
                                ? 'bg-green-100 text-green-800'
                                : conflict.resolution === 'auto_resolved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {conflict.resolution.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Printful Data</h5>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(conflict.printfulData, null, 2)}
                              </pre>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Local Data</h5>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(conflict.localData, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          {conflict.autoResolution && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Auto-resolution:</strong> {conflict.autoResolution}
                              </p>
                            </div>
                          )}
                          
                          {conflict.resolution === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleResolveConflict(conflict.id, 'accept_printful')}
                                className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 border border-green-200 rounded hover:bg-green-200"
                              >
                                Accept Printful
                              </button>
                              <button
                                onClick={() => handleResolveConflict(conflict.id, 'accept_local')}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200"
                              >
                                Accept Local
                              </button>
                              <button
                                onClick={() => handleResolveConflict(conflict.id, 'manual')}
                                className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 border border-yellow-200 rounded hover:bg-yellow-200"
                              >
                                Manual Review
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Sync Settings</h4>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Enable auto-refresh
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Automatically refresh sync data every 30 seconds
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={refreshInterval / 1000}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                        className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum: 10 seconds, Maximum: 5 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintfulSyncMonitor;
