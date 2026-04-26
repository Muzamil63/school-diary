import api from './api';

export const classService = {
  // Get all classes
  getClasses: (params = {}) => api.get('/classes', { params }),

  // Get single class with students
  getClass: (id) => api.get(`/classes/${id}`),

  // Create class (admin)
  createClass: (data) => api.post('/classes', data),

  // Update class (admin)
  updateClass: (id, data) => api.put(`/classes/${id}`, data),

  // Delete class (admin)
  deleteClass: (id) => api.delete(`/classes/${id}`),

  // Get subjects
  getSubjects: (params = {}) => api.get('/subjects', { params }),

  // Create subject
  createSubject: (data) => api.post('/subjects', data),

  // Update subject
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),

  // Delete subject
  deleteSubject: (id) => api.delete(`/subjects/${id}`),

  // Get students in a class
  getClassStudents: (classId) => api.get(`/classes/${classId}/students`),

  // Assign teacher to class/subject
  assignTeacher: (classId, data) =>
    api.post(`/classes/${classId}/teachers`, data),
};
