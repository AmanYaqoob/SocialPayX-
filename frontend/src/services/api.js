const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://socialpayx.com/api';

class ApiService {
  constructor() {
    this.token = null;
    this._manualToken = null;
    this.updateToken();
  }

  updateToken() {
    this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    this._manualToken = token;
  }

  clearManualToken() {
    this._manualToken = null;
  }

  removeToken() {
    this.token = null;
    this._manualToken = null;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    if (!this._manualToken) this.updateToken();
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
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(email, password)                    { return this.request('/auth/login',          { method: 'POST', body: { email, password } }); }
  async register(email, password, username, ref)  { return this.request('/auth/register',       { method: 'POST', body: { email, password, username, referralCode: ref } }); }
  async verifyEmail(email, code)                  { return this.request('/auth/verify-email',   { method: 'POST', body: { email, code } }); }
  async forgotPassword(email)                     { return this.request('/auth/forgot-password',{ method: 'POST', body: { email } }); }
  async resetPassword(token, password)            { return this.request('/auth/reset-password', { method: 'POST', body: { token, password } }); }

  // ── User ──────────────────────────────────────────────────────────────────
  async getProfile()              { return this.request('/user/profile'); }
  async updateProfile(data)       { return this.request('/user/profile',               { method: 'PUT', body: data }); }
  async getSocialStats()          { return this.request('/user/social-stats'); }
  async followUser(userId)        { return this.request(`/user/${userId}/follow`,       { method: 'POST' }); }
  async getFollowStatus(userId)   { return this.request(`/user/${userId}/follow-status`); }
  async getFollowers(userId)      { return this.request(`/user/${userId}/followers`); }
  async getFollowing(userId)      { return this.request(`/user/${userId}/following`); }

  // ── Mining ────────────────────────────────────────────────────────────────
  async startMining()         { return this.request('/mining/start',  { method: 'POST' }); }
  async stopMining()          { return this.request('/mining/stop',   { method: 'POST' }); }
  async getMiningStatus()     { return this.request('/mining/status'); }

  // ── KYC ───────────────────────────────────────────────────────────────────
  async submitKYC(tid)        { return this.request('/kyc/submit',  { method: 'POST', body: { tid } }); }
  async getKYCStatus()        { return this.request('/kyc/status'); }

  // ── Referral ──────────────────────────────────────────────────────────────
  async getReferralInfo()     { return this.request('/referral/info'); }
  async getReferralStats()    { return this.request('/referral/stats'); }

  // ── Wallet ────────────────────────────────────────────────────────────────
  async getWalletBalance()    { return this.request('/wallet/balance'); }
  async requestWithdrawal(amount, address) { return this.request('/wallet/withdraw', { method: 'POST', body: { amount, address } }); }
  async getWithdrawals()      { return this.request('/wallet/withdrawals'); }

  // ── News ──────────────────────────────────────────────────────────────────
  async getNews(params = {})  { const q = new URLSearchParams(params).toString(); return this.request(`/news${q ? '?' + q : ''}`); }
  async getNewsById(id)       { return this.request(`/news/${id}`); }
  async getAllNews()           { return this.request('/news/admin/all'); }
  async createNews(data)      { return this.request('/news',      { method: 'POST',   body: data }); }
  async updateNews(id, data)  { return this.request(`/news/${id}`,{ method: 'PUT',    body: data }); }
  async deleteNews(id)        { return this.request(`/news/${id}`,{ method: 'DELETE' }); }

  // ── Social Feed ───────────────────────────────────────────────────────────
  async getFeed(page = 1, limit = 10)    { return this.request(`/feed?page=${page}&limit=${limit}`); }
  async createPost(content, mediaUrl, mediaType) { return this.request('/feed', { method: 'POST', body: { content, mediaUrl, mediaType } }); }
  async likePost(postId)                 { return this.request(`/feed/${postId}/like`,    { method: 'POST' }); }
  async viewPost(postId)                 { return this.request(`/feed/${postId}/view`,    { method: 'POST' }); }  // ← NEW
  async commentOnPost(postId, text)      { return this.request(`/feed/${postId}/comment`, { method: 'POST', body: { text } }); }
  async getComments(postId)              { return this.request(`/feed/${postId}/comments`); }
  async sharePost(postId)                { return this.request(`/feed/${postId}/share`,   { method: 'POST' }); }
  async deletePost(postId)              { return this.request(`/feed/${postId}`,          { method: 'DELETE' }); }
  async uploadMedia(file, resourceType) { return this.request('/upload',                  { method: 'POST', body: { file, resourceType } }); }  // ← NEW

  // ── Admin ─────────────────────────────────────────────────────────────────
  async getAdminDashboard()   { return this.request('/admin/dashboard'); }
  async getUsers()            { return this.request('/admin/users'); }
  async updateUserStatus(userId, isActive) { return this.request(`/admin/users/${userId}/status`, { method: 'PUT', body: { isActive } }); }
  async getKYCSubmissions(status = 'pending') { return this.request(`/admin/kyc?status=${status}`); }
  async reviewKYC(userId, status, rejectionReason) { return this.request(`/admin/kyc/${userId}/review`, { method: 'PUT', body: { status, rejectionReason } }); }
  async getSettings()         { return this.request('/admin/settings/public'); }
  async getAdminSettings()    { return this.request('/admin/settings'); }
  async updateSettings(s)     { return this.request('/admin/settings', { method: 'PUT', body: s }); }
  async getWithdrawalRequests(status = 'pending') { return this.request(`/admin/withdrawals?status=${status}`); }
  async processWithdrawal(userId, withdrawalId, status) { return this.request(`/admin/withdrawals/${userId}/${withdrawalId}`, { method: 'PUT', body: { status } }); }

  // ── Admin Tasks ───────────────────────────────────────────────────────────
  async getAdminTasks()            { return this.request('/admin/tasks'); }
  async createAdminTask(data)      { return this.request('/admin/tasks',      { method: 'POST',   body: data }); }
  async updateAdminTask(id, data)  { return this.request(`/admin/tasks/${id}`,{ method: 'PUT',    body: data }); }
  async deleteAdminTask(id)        { return this.request(`/admin/tasks/${id}`,{ method: 'DELETE' }); }
}

export default new ApiService();
