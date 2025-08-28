import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Button } from '../ui/button';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { adminUser, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/Leaven Logo.png" 
              alt="LVN Clothing" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-lvn-maroon text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-lvn-maroon rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {adminUser?.email}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {adminUser?.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-2 sm:p-3 lg:p-4">
          <Outlet />
        </main>
      </div>

      {/* Close dropdown when clicking outside */}
      {profileDropdownOpen && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
