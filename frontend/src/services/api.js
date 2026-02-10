const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.token = null;
    this.updateToken();
  }

  updateToken() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    this.updateToken(); // Refresh token before each request
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: data,
    });
  }
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(email, password, username, referralCode) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, password, username, referralCode },
    });
  }

  async verifyEmail(email, code) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: { email, code },
    });
  }

  // Mining endpoints
  async startMining() {
    return this.request('/mining/start', { method: 'POST' });
  }

  async stopMining() {
    return this.request('/mining/stop', { method: 'POST' });
  }

  async getMiningStatus() {
    return this.request('/mining/status');
  }

  // KYC endpoints
  async submitKYC(tid) {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: { tid },
    });
  }

  async getKYCStatus() {
    return this.request('/kyc/status');
  }

  // Referral endpoints
  async getReferralInfo() {
    return this.request('/referral/info');
  }

  async getReferralStats() {
    return this.request('/referral/stats');
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async requestWithdrawal(amount, address) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: { amount, address },
    });
  }

  async getWithdrawals() {
    return this.request('/wallet/withdrawals');
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getUsers() {
    return this.request('/admin/users');
  }

  async updateUserStatus(userId, isActive) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { isActive },
    });
  }

  async getKYCSubmissions(status = 'pending') {
    return this.request(`/admin/kyc?status=${status}`);
  }

  async reviewKYC(userId, status, rejectionReason) {
    return this.request(`/admin/kyc/${userId}/review`, {
      method: 'PUT',
      body: { status, rejectionReason },
    });
  }

  async getSettings() {
    return this.request('/admin/settings/public');
  }

  async getAdminSettings() {
    return this.request('/admin/settings');
  }

  // News endpoints
  async getNews(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/news${query ? '?' + query : ''}`);
  }

  async getNewsById(id) {
    return this.request(`/news/${id}`);
  }

  async getAllNews() {
    return this.request('/news/admin/all');
  }

  async createNews(data) {
    return this.request('/news', {
      method: 'POST',
      body: data,
    });
  }

  async updateNews(id, data) {
    return this.request(`/news/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteNews(id) {
    return this.request(`/news/${id}`, {
      method: 'DELETE',
    });
  }

  async updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: settings,
    });
  }

  async getWithdrawalRequests(status = 'pending') {
    return this.request(`/admin/withdrawals?status=${status}`);
  }

  async processWithdrawal(userId, withdrawalId, status) {
    return this.request(`/admin/withdrawals/${userId}/${withdrawalId}`, {
      method: 'PUT',
      body: { status },
    });
  }
}

export default new ApiService();