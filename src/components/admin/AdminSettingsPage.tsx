import React, { useState } from 'react';
import { Save, Globe, Mail, Shield, Palette, Database } from 'lucide-react';
import { Button } from '../ui/button';

const AdminSettingsPage = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your LVN Clothing admin dashboard</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="LVN Clothing"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                defaultValue="admin@lvnclothing.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent">
                <option value="GMT">GMT (London)</option>
                <option value="EST">EST (Eastern Time)</option>
                <option value="PST">PST (Pacific Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                defaultValue="587"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                defaultValue="noreply@lvnclothing.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for admin access</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div>
              <Button variant="outline" size="sm" className="text-lvn-maroon">
                Change Admin Password
              </Button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidebar Position
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard Layout
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent">
                <option value="default">Default</option>
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center mb-4">
          <Database className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Database & Integrations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Project URL
              </label>
              <input
                type="text"
                defaultValue="https://xxx.supabase.co"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Printful API Key
              </label>
              <input
                type="password"
                defaultValue="pk_..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Secret Key
              </label>
              <input
                type="password"
                defaultValue="sk_..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resend API Key
              </label>
              <input
                type="password"
                defaultValue="re_..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-lvn-maroon hover:bg-lvn-maroon/90"
          disabled={saved}
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
