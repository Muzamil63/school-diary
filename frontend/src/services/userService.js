import api from './api';

export const userService = {
  // List users (admin)
  getUsers: (params = {}) => api.get('/users', { params }),

  // Get single user
  getUser: (id) => api.get(`/users/${id}`),

  // Create user (admin)
  createUser: (data) => api.post('/users', data),

  // Update user
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // Delete user (admin)
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Get students list
  getStudents: (params = {}) => api.get('/users/students', { params }),

  // Get teachers list
  getTeachers: (params = {}) => api.get('/users/teachers', { params }),

  // Assign student to parent
  assignStudentToParent: (parentId, studentId) =>
    api.post(`/users/parents/${parentId}/students`, { student_id: studentId }),

  // Remove student from parent
  removeStudentFromParent: (parentId, studentId) =>
    api.delete(`/users/parents/${parentId}/students/${studentId}`),

  // Get activity logs (admin)
  getActivityLogs: (params = {}) => api.get('/users/activity-logs', { params }),
};
