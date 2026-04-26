import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, GraduationCap, FileText,
  TrendingUp, Activity, Clock, CheckCircle2
} from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockStats, mockDiaryService, mockUserService } from '../../services/mockApiService';
import { format, parseISO } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, entriesRes, logsRes] = await Promise.all([
          mockStats.getAdminStats(),
          mockDiaryService.getEntries({ page: 1 }),
          mockUserService.getActivityLogs({ page: 1 }),
        ]);
        setStats(statsRes.data);
        setRecentEntries(entriesRes.data.data.data.slice(0, 5));
        setRecentLogs(logsRes.data.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats?.totalUsers} icon={Users} color="blue" trend={12} />
        <StatsCard title="Teachers" value={stats?.totalTeachers} icon={GraduationCap} color="indigo" />
        <StatsCard title="Students" value={stats?.totalStudents} icon={BookOpen} color="green" />
        <StatsCard title="Diary Entries" value={stats?.totalEntries} icon={FileText} color="purple" trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent diary entries */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Diary Entries</h2>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-lg mt-0.5">
                  {entry.type === 'homework' ? '📚' : entry.type === 'announcement' ? '📢' : '💬'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.teacher_name} · {entry.class_name || 'All Classes'}
                  </p>
                </div>
                <Badge variant={entry.type}>
                  {entry.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-400">{log.user} · {log.detail}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {format(parseISO(log.timestamp), 'MMM d')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role distribution */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Admins', value: 1, color: 'bg-red-500', pct: 11 },
            { label: 'Teachers', value: stats?.totalTeachers, color: 'bg-blue-500', pct: 33 },
            { label: 'Students', value: stats?.totalStudents, color: 'bg-green-500', pct: 33 },
            { label: 'Parents', value: stats?.totalParents || 2, color: 'bg-purple-500', pct: 22 },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{item.label}</div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
