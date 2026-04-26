import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { mockClassService, mockUserService } from '../../services/mockApiService';
import { classService } from '../../services/classService';
import { userService } from '../../services/userService';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const activeClassService = isDemoMode ? mockClassService : classService;
const activeUserService = isDemoMode ? mockUserService : userService;

const ENTRY_TYPES = [
  { value: 'homework', label: '📚 Homework' },
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'remark', label: '💬 Student Remark' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'homework',
  class_id: '',
  subject_id: '',
  student_id: '',
  due_date: '',
};

export default function DiaryForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initialData ? { ...INITIAL_FORM, ...initialData } : INITIAL_FORM);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes, studentRes] = await Promise.all([
          activeClassService.getClasses(),
          activeClassService.getSubjects(),
          activeUserService.getStudents(),
        ]);
        setClasses(classRes.data.data || []);
        setSubjects(subjectRes.data.data || []);
        setStudents(studentRes.data.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.type) errs.type = 'Type is required';
    if (form.type === 'remark' && !form.student_id) errs.student_id = 'Select a student for remarks';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      class_id: form.class_id || null,
      subject_id: form.subject_id || null,
      student_id: form.type === 'remark' ? form.student_id : null,
      due_date: form.type === 'homework' && form.due_date ? form.due_date : null,
    };
    onSubmit(payload);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Entry Type</label>
        <div className="grid grid-cols-3 gap-2">
          {ENTRY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('type', value)}
              className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                form.type === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Enter a clear, descriptive title"
          className={`input-field ${errors.title ? 'border-red-400' : ''}`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Provide detailed instructions or information..."
          rows={4}
          className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Class & Subject row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
          <select
            value={form.class_id}
            onChange={(e) => set('class_id', e.target.value)}
            className="input-field"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
          <select
            value={form.subject_id}
            onChange={(e) => set('subject_id', e.target.value)}
            className="input-field"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Remark: student selector */}
      {form.type === 'remark' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Student <span className="text-red-500">*</span>
          </label>
          <select
            value={form.student_id}
            onChange={(e) => set('student_id', e.target.value)}
            className={`input-field ${errors.student_id ? 'border-red-400' : ''}`}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.student_id && <p className="mt-1 text-xs text-red-500">{errors.student_id}</p>}
        </div>
      )}

      {/* Homework: due date */}
      {form.type === 'homework' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            initialData ? 'Update Entry' : 'Create Entry'
          )}
        </button>
      </div>
    </form>
  );
}
