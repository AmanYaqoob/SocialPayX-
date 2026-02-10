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