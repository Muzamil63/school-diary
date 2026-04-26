import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Loader2, GraduationCap } from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockClassService } from '../../services/mockApiService';
import toast from 'react-hot-toast';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  // Class modal state
  const [classModal, setClassModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', section: '' });
  const [classErrors, setClassErrors] = useState({});
  const [savingClass, setSavingClass] = useState(false);
  const [deleteClass, setDeleteClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(false);

  // Subject modal state
  const [subjectModal, setSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '' });
  const [savingSubject, setSavingSubject] = useState(false);
  const [deleteSubject, setDeleteSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, subjectRes] = await Promise.all([
        mockClassService.getClasses(),
        mockClassService.getSubjects(),
      ]);
      setClasses(classRes.data.data || []);
      setSubjects(subjectRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveClass = async () => {
    if (!classForm.name.trim()) {
      setClassErrors({ name: 'Class name is required' });
      return;
    }
    setSavingClass(true);
    try {
      if (editClass) {
        await mockClassService.updateClass(editClass.id, classForm);
        toast.success('Class updated');
      } else {
        await mockClassService.createClass(classForm);
        toast.success('Class created');
      }
      setClassModal(false);
      fetchData();
    } catch {
      toast.error('Failed to save class');
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async () => {
    setDeletingClass(true);
    try {
      await mockClassService.deleteClass(deleteClass.id);
      toast.success('Class deleted');
      setDeleteClass(null);
      fetchData();
    } catch {
      toast.error('Failed to delete class');
    } finally {
      setDeletingClass(false);
    }
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.name.trim()) return;
    setSavingSubject(true);
    try {
      await mockClassService.createSubject(subjectForm);
      toast.success('Subject created');
      setSubjectModal(false);
      setSubjectForm({ name: '' });
      fetchData();
    } catch {
      toast.error('Failed to create subject');
    } finally {
      setSavingSubject(false);
    }
  };

  const handleDeleteSubject = async () => {
    setDeletingSubject(true);
    try {
      await mockClassService.deleteSubject(deleteSubject.id);
      toast.success('Subject deleted');
      setDeleteSubject(null);
      fetchData();
    } catch {
      toast.error('Failed to delete subject');
    } finally {
      setDeletingSubject(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Classes & Subjects</h1>
        <p className="text-gray-500 text-sm mt-1">Manage academic structure</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['classes', 'subjects'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditClass(null); setClassForm({ name: '', section: '' }); setClassModal(true); }}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="card flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cls.student_count} students · Section {cls.section}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditClass(cls); setClassForm({ name: cls.name, section: cls.section }); setClassModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteClass(cls)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setSubjectForm({ name: '' }); setSubjectModal(true); }}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => (
              <div key={subj.id} className="card flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">{subj.name}</p>
                </div>
                <button
                  onClick={() => setDeleteSubject(subj)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Modal */}
      <Modal isOpen={classModal} onClose={() => setClassModal(false)} title={editClass ? 'Edit Class' : 'Add Class'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name</label>
            <input
              type="text"
              value={classForm.name}
              onChange={(e) => { setClassForm((f) => ({ ...f, name: e.target.value })); setClassErrors({}); }}
              placeholder="e.g. Grade 10-A"
              className={`input-field ${classErrors.name ? 'border-red-400' : ''}`}
            />
            {classErrors.name && <p className="mt-1 text-xs text-red-500">{classErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Section</label>
            <input
              type="text"
              value={classForm.section}
              onChange={(e) => setClassForm((f) => ({ ...f, section: e.target.value }))}
              placeholder="e.g. A"
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setClassModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSaveClass} disabled={savingClass} className="btn-primary flex-1">
              {savingClass ? <Loader2 className="w-4 h-4 animate-spin" /> : editClass ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Subject Modal */}
      <Modal isOpen={subjectModal} onClose={() => setSubjectModal(false)} title="Add Subject" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Name</label>
            <input
              type="text"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ name: e.target.value })}
              placeholder="e.g. Mathematics"
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSubjectModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSaveSubject} disabled={savingSubject} className="btn-primary flex-1">
              {savingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirms */}
      <ConfirmDialog
        isOpen={!!deleteClass}
        onClose={() => setDeleteClass(null)}
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message={`Delete "${deleteClass?.name}"? All related diary entries will lose their class reference.`}
        loading={deletingClass}
      />
      <ConfirmDialog
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={`Delete "${deleteSubject?.name}"?`}
        loading={deletingSubject}
      />
    </div>
  );
}
