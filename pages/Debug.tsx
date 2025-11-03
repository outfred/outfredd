import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const Debug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dec0bed9`;

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      setResult({ success: true, data, message: 'Server is healthy!' });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetDemoData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reset-demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      setResult({ success: response.ok, data, message: 'Demo data reset!' });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: 'admin@outfred.com',
          password: 'admin123'
        })
      });
      const data = await response.json();
      
      // Store token if login successful
      if (response.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      setResult({ 
        success: response.ok, 
        data, 
        message: response.ok ? 'Login successful! Token stored.' : 'Login failed!'
      });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setResult({ 
          success: false, 
          message: 'No token found. Please login first.' 
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/test-auth`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Access-Token': token
        }
      });
      const data = await response.json();
      setResult({ 
        success: response.ok, 
        data, 
        message: response.ok ? 'Authentication valid!' : 'Authentication failed!'
      });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAdminEndpoint = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setResult({ 
          success: false, 
          message: 'No token found. Please login first.' 
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Access-Token': token
        }
      });
      const data = await response.json();
      setResult({ 
        success: response.ok, 
        data, 
        message: response.ok ? 'Analytics loaded!' : 'Failed to load analytics'
      });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/debug/db-status`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      setResult({ 
        success: response.ok, 
        data, 
        message: response.ok ? 'Database status retrieved!' : 'Failed to get status'
      });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
          <div className="mb-6">
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              🔧 Debug Panel
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use this panel to diagnose and fix authentication issues
            </p>
            
            {/* Quick Status */}
            <div className="flex gap-2 items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              {localStorage.getItem('accessToken') ? (
                <Badge className="bg-green-500">✅ Token Found</Badge>
              ) : (
                <Badge className="bg-red-500">❌ Not Logged In</Badge>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {/* Quick Login Button (if not logged in) */}
            {!localStorage.getItem('accessToken') && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm mb-3">
                  <strong>⚡ Quick Fix:</strong> Login as admin to access protected endpoints
                </p>
                <Button
                  onClick={async () => {
                    await testLogin();
                    setTimeout(() => {
                      window.location.hash = 'admin';
                      window.location.reload();
                    }, 1500);
                  }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  🚀 Quick Login & Go to Admin
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={testHealth}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Test Health
              </Button>

              <Button
                onClick={checkDatabaseStatus}
                disabled={loading}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Check DB Status
              </Button>

              <Button
                onClick={resetDemoData}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
              >
                Reset Demo Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Button
                onClick={testLogin}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Test Login
              </Button>

              <Button
                onClick={testAuth}
                disabled={loading}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                Test Authentication
              </Button>

              <Button
                onClick={testAdminEndpoint}
                disabled={loading}
                variant="outline"
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                Test Admin Analytics
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Testing...</p>
            </div>
          )}

          {result && !loading && (
            <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={result.success ? 'bg-green-500' : 'bg-red-500'}>
                      {result.success ? 'Success' : 'Error'}
                    </Badge>
                    <span>{result.message}</span>
                  </div>
                  
                  {result.data && (
                    <pre className="mt-4 p-4 bg-black/10 rounded-lg overflow-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}

                  {result.error && (
                    <p className="text-red-600 dark:text-red-400 mt-2">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="mb-2">📧 Demo Credentials:</h3>
              <p className="text-sm">Email: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">admin@outfred.com</code></p>
              <p className="text-sm mt-1">Password: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">admin123</code></p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="mb-3">⚠️ Troubleshooting Steps:</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>
                  <strong>Check DB Status</strong> - Verify database has users
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 mt-1">
                    Should show at least 1 valid user with email "admin@outfred.com"
                  </p>
                </li>
                <li>
                  <strong>Reset Demo Data</strong> - If no users found, initialize database
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 mt-1">
                    This creates the admin account and demo merchants
                  </p>
                </li>
                <li>
                  <strong>Test Login</strong> - Verify credentials work
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 mt-1">
                    Should return success:true with accessToken
                  </p>
                </li>
                <li>
                  <strong>Test Authentication</strong> - Verify token is valid
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 mt-1">
                    Should return authenticated:true with user data
                  </p>
                </li>
                <li>
                  <strong>Test Admin Analytics</strong> - Verify admin access works
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-5 mt-1">
                    Should return analytics data
                  </p>
                </li>
              </ol>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 className="mb-2">🔧 API Info:</h3>
              <p className="text-xs break-all">Base URL: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{API_BASE}</code></p>
              <p className="text-xs break-all mt-2">Project ID: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{projectId}</code></p>
              <p className="text-xs mt-2">Token in Storage: {localStorage.getItem('accessToken') ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
