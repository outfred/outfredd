// Admin API Helper Functions
// Frontend utilities for calling admin backend endpoints

const API_URL = 'https://jnnzjcqaxfxphkdvlxrv.supabase.co/functions/v1/server/make-server-dec0bed9';

// Helper: Get auth token
const getToken = () => localStorage.getItem('token');

// Helper: Make authenticated request
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Token': token || '',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// =============================================================================
// CMS API
// =============================================================================

export const cmsApi = {
  async getAll() {
    return apiRequest('/admin/cms');
  },
  
  async getPage(pageKey: string) {
    return apiRequest(`/admin/cms/${pageKey}`);
  },
  
  async updatePage(pageKey: string, data: any) {
    return apiRequest(`/admin/cms/${pageKey}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// Site Settings API
// =============================================================================

export const siteSettingsApi = {
  async getAll() {
    return apiRequest('/admin/site-settings');
  },
  
  async update(key: string, value: any) {
    return apiRequest(`/admin/site-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },
};

// =============================================================================
// Payment Settings API
// =============================================================================

export const paymentApi = {
  async get() {
    return apiRequest('/admin/payment-settings');
  },
  
  async update(data: any) {
    return apiRequest('/admin/payment-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// SMTP Settings API
// =============================================================================

export const smtpApi = {
  async get() {
    return apiRequest('/admin/smtp');
  },
  
  async update(data: any) {
    return apiRequest('/admin/smtp', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async sendTest(toEmail: string) {
    return apiRequest('/admin/smtp/test', {
      method: 'POST',
      body: JSON.stringify({ to_email: toEmail }),
    });
  },
};

// =============================================================================
// Subscriptions API
// =============================================================================

export const subscriptionsApi = {
  async getAll(type?: 'user' | 'merchant') {
    const query = type ? `?type=${type}` : '';
    return apiRequest(`/admin/subscriptions${query}`);
  },
  
  async update(id: string, data: any) {
    return apiRequest(`/admin/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// =============================================================================
// User Subscription Management API
// =============================================================================

export const userSubscriptionApi = {
  async updateUserSubscription(userId: string, data: any) {
    return apiRequest(`/admin/users/${userId}/subscription`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
