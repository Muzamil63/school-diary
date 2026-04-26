import React, { useState, useEffect } from 'react';
import { FileText, BookOpen, Megaphone, MessageSquare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import DiaryCard from '../../components/diary/DiaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockStats, mockDiaryService } from '../../services/mockApiService';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, entriesRes] = await Promise.all([
          mockStats.getTeacherStats(user?.id),
          mockDiaryService.getEntries({ teacher_id: user?.id, page: 1 }),
        ]);
        setStats(statsRes.data);
        setRecentEntries(entriesRes.data.data.data.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-primary-100 text-sm mt-1">
          You have {stats?.myEntries || 0} diary entries this term.
        </p>
        <button
          onClick={() => navigate('/teacher/diary')}
          className="mt-4 bg-white text-primary-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          + New Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Entries" value={stats?.myEntries} icon={FileText} color="blue" />
        <StatsCard title="Homework" value={stats?.homeworkCount} icon={BookOpen} color="indigo" />
        <StatsCard title="Announcements" value={stats?.announcementCount} icon={Megaphone} color="green" />
        <StatsCard title="Remarks" value={stats?.remarkCount} icon={MessageSquare} color="purple" />
      </div>

      {/* Recent entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-lg">Recent Entries</h2>
          <button
            onClick={() => navigate('/teacher/diary')}
            className="text-sm text-primary-600 font-medium hover:text-primary-700"
          >
            View all →
          </button>
        </div>
        {recentEntries.length === 0 ? (
          <div className="card text-center py-10">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No entries yet. Create your first diary entry!</p>
            <button onClick={() => navigate('/teacher/diary')} className="btn-primary mt-4">
              Create Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentEntries.map((entry) => (
              <DiaryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Quick tips */}
      <div className="card bg-amber-50 border-amber-100">
        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Quick Tips
        </h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Use <strong>Homework</strong> entries to assign tasks with due dates</li>
          <li>• <strong>Announcements</strong> reach all students in a class or school-wide</li>
          <li>• <strong>Remarks</strong> are personal notes visible only to the student and their parents</li>
        </ul>
      </div>
    </div>
  );
}
