import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Router chunk
          'router': ['react-router-dom'],
          // UI components chunk  
          'ui-vendor': ['lucide-react', 'react-icons'],
          // Supabase chunk
          'supabase': ['@supabase/supabase-js'],
          // Admin components chunk
          'admin': [
            './src/components/admin/AdminLayout',
            './src/components/admin/AdminOverviewPage',
            './src/components/admin/AdminOrdersPage',
            './src/components/admin/AdminProductsPage',
            './src/components/admin/AdminCustomersPage',
            './src/components/admin/AdminSettingsPage'
          ]
        }
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  }
});
