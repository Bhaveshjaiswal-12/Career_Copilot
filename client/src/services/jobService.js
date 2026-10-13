import api from './api.js';

export const jobService = {
  /**
   * Search jobs with filters
   */
  async getJobs(params = {}) {
    const res = await api.get('/jobs', { params });
    return res.data;
  },

  /**
   * Get user's saved jobs
   */
  async getSavedJobs() {
    const res = await api.get('/jobs/saved');
    return res.data;
  },

  /**
   * Save a job to user's list
   */
  async saveJob(jobData) {
    const res = await api.post('/jobs/save', jobData);
    return res.data;
  },

  /**
   * Remove a saved job
   */
  async removeSavedJob(jobId) {
    const res = await api.delete(`/jobs/${jobId}/save`);
    return res.data;
  },

  /**
   * Update saved job status or notes
   */
  async updateSavedJob(jobId, updates) {
    const res = await api.patch(`/jobs/${jobId}/saved`, updates);
    return res.data;
  },
};

export default jobService;
