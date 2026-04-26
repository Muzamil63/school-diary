import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import Modal from '../../components/common/Modal';
import DiaryCard from '../../components/diary/DiaryCard';
import DiaryForm from '../../components/diary/DiaryForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockDiaryService } from '../../services/mockApiService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TYPES = ['homework', 'announcement', 'remark'];

export default function DiaryManagement() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await mockDiaryService.getEntries({
        teacher_id: user?.id,
        type: typeFilter,
        search,
        page,
      });
      setEntries(res.data.data.data);
      setMeta(res.data.data.meta);
    } finally {
      setLoading(false);
    }
  }, [user, typeFilter, search]);

  useEffect(() => { fetchEntries(1); }, [fetchEntries]);

  const openCreate = () => {
    setEditEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditEntry(entry);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editEntry) {
        await mockDiaryService.updateEntry(editEntry.id, {
          ...data,
          teacher_id: user?.id,
          teacher_name: user?.name,
        });
        toast.success('Entry updated!');
      } else {
        await mockDiaryService.createEntry({
          ...data,
          teacher_id: user?.id,
          teacher_name: user?.name,
        });
        toast.success('Entry created!');
      }
      setModalOpen(false);
      fetchEntries(meta.current_page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await mockDiaryService.deleteEntry(deleteTarget.id);
      toast.success('Entry deleted');
      setDeleteTarget(null);
      fetchEntries(1);
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diary Entries</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage homework, announcements, and remarks</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-44"
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner text="Loading entries..." />
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-14">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No diary entries found</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Entry" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              showActions
              onEdit={openEdit}
              onDelete={(e) => setDeleteTarget(e)}
            />
          ))}
          {meta.last_page > 1 && (
            <div className="card p-0">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={fetchEntries}
              />
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editEntry ? 'Edit Diary Entry' : 'Create New Entry'}
        size="lg"
      >
        <DiaryForm
          initialData={editEntry}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
