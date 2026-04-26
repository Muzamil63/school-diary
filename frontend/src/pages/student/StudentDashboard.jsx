import React, { useState, useEffect } from 'react';
import { BookOpen, Megaphone, MessageSquare, Filter, Calendar } from 'lucide-react';
import DiaryCard from '../../components/diary/DiaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { mockDiaryService } from '../../services/mockApiService';
import { useAuth } from '../../context/AuthContext';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '📚 Homework', value: 'homework' },
  { label: '📢 Announcements', value: 'announcement' },
  { label: '💬 Remarks', value: 'remark' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [counts, setCounts] = useState({ homework: 0, announcement: 0, remark: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRes, filteredRes] = await Promise.all([
          mockDiaryService.getEntries({}),
          mockDiaryService.getEntries({ type: filter, page: 1 }),
        ]);
        const allEntries = allRes.data.data.data;
        setCounts({
          homework: allEntries.filter((e) => e.type === 'homework').length,
          announcement: allEntries.filter((e) => e.type === 'announcement').length,
          remark: allEntries.filter((e) => e.student_id === user?.id || !e.student_id).filter((e) => e.type === 'remark').length,
        });
        // Students see entries for their class + their personal remarks + announcements
        const visible = filteredRes.data.data.data.filter(
          (e) =>
            e.type === 'announcement' ||
            e.type === 'homework' ||
            (e.type === 'remark' && (e.student_id == user?.id || !e.student_id))
        );
        setEntries(visible);
        setMeta(filteredRes.data.data.meta);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, user]);

  // Check upcoming homework due dates
  const upcoming = entries
    .filter((e) => e.type === 'homework' && e.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold">Hello, {user?.name}! 📖</h1>
        <p className="text-green-100 text-sm mt-1">
          Stay on top of your homework and class updates.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Homework', value: counts.homework, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
          { label: 'Announcements', value: counts.announcement, icon: Megaphone, color: 'text-green-600 bg-green-50' },
          { label: 'My Remarks', value: counts.remark, icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center p-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming homework */}
      {upcoming.length > 0 && (
        <div className="card border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-orange-600" />
            <h2 className="font-semibold text-orange-900 text-sm">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-2">
            {upcoming.map((hw) => (
              <div key={hw.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-gray-800 truncate">{hw.title}</p>
                <span className="text-xs text-orange-600 font-semibold ml-3 flex-shrink-0">
                  Due {hw.due_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <LoadingSpinner text="Loading updates..." />
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No updates found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} />
          ))}
          {meta.last_page > 1 && (
            <div className="card p-0">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={(page) => {
                  // re-fetch with page
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
