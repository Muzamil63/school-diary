import React, { useState, useEffect } from 'react';
import { BookOpen, Megaphone, MessageSquare, Calendar, User, Bell } from 'lucide-react';
import DiaryCard from '../../components/diary/DiaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { mockDiaryService } from '../../services/mockApiService';
import { useAuth } from '../../context/AuthContext';

const FILTERS = [
  { label: 'All Updates', value: '' },
  { label: '📚 Homework', value: 'homework' },
  { label: '📢 Announcements', value: 'announcement' },
  { label: '💬 Remarks', value: 'remark' },
];

// Mock child info — in production comes from /api/users/parents/{id}/students
const CHILD_INFO = {
  name: 'Michael Brown',
  class: 'Grade 10-A',
  rollNumber: 'STU-2024-004',
  attendance: '94%',
};

export default function ParentDashboard() {
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
        const res = await mockDiaryService.getForParent({ page: 1 });
        const all = res.data.data;
        setCounts({
          homework: all.filter((e) => e.type === 'homework').length,
          announcement: all.filter((e) => e.type === 'announcement').length,
          remark: all.filter((e) => e.type === 'remark').length,
        });
        const filtered = filter ? all.filter((e) => e.type === filter) : all;
        setEntries(filtered);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const upcoming = entries
    .filter((e) => e.type === 'homework' && e.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold">Welcome, {user?.name}! 👨‍👩‍👧</h1>
        <p className="text-purple-100 text-sm mt-1">
          Monitor your child's academic progress and updates.
        </p>
      </div>

      {/* Child info card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">{CHILD_INFO.name}</p>
            <p className="text-sm text-gray-500">{CHILD_INFO.class} · Roll# {CHILD_INFO.rollNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{CHILD_INFO.attendance}</p>
            <p className="text-xs text-gray-400">Attendance</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Homework', value: counts.homework, icon: BookOpen, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Announcements', value: counts.announcement, icon: Megaphone, bg: 'bg-green-50', text: 'text-green-600' },
          { label: 'Remarks', value: counts.remark, icon: MessageSquare, bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="card text-center p-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <div className="card border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-orange-600" />
            <h2 className="font-semibold text-orange-900 text-sm">
              Upcoming Homework Deadlines
            </h2>
          </div>
          <div className="space-y-2">
            {upcoming.map((hw) => (
              <div
                key={hw.id}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{hw.title}</p>
                  <p className="text-xs text-gray-400">{hw.subject_name || 'General'}</p>
                </div>
                <span className="text-xs text-orange-600 font-semibold flex-shrink-0 ml-3">
                  Due {hw.due_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification tip */}
      <div className="card bg-sky-50 border-sky-100 flex items-start gap-3">
        <Bell className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sky-800">
          You'll receive notifications when teachers post new homework or remarks for your child.
        </p>
      </div>

      {/* Filter buttons */}
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

      {/* Diary entries */}
      {loading ? (
        <LoadingSpinner text="Loading updates..." />
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No updates found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
