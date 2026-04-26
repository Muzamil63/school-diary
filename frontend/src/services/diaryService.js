import api from './api';

export const diaryService = {
  // Get entries with optional filters
  getEntries: (params = {}) => api.get('/diary', { params }),

  // Get a single entry
  getEntry: (id) => api.get(`/diary/${id}`),

  // Create a new diary entry
  createEntry: (data) => api.post('/diary', data),

  // Update an existing entry
  updateEntry: (id, data) => api.put(`/diary/${id}`, data),

  // Delete an entry
  deleteEntry: (id) => api.delete(`/diary/${id}`),

  // Get entries for a specific class
  getByClass: (classId, params = {}) =>
    api.get(`/diary/class/${classId}`, { params }),

  // Get entries for a specific student
  getByStudent: (studentId, params = {}) =>
    api.get(`/diary/student/${studentId}`, { params }),

  // Get entries for parent's children
  getForParent: (params = {}) => api.get('/diary/parent', { params }),
};
