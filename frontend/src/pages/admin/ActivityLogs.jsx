import React, { useState, useEffect } from 'react';
import { Activity, Search, Clock } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockUserService } from '../../services/mockApiService';
import { format, parseISO } from 'date-fns';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await mockUserService.getActivityLogs({ page });
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const ACTION_ICONS = {
    'Created diary entry': '📝',
    'Created user account': '👤',
    'Updated class': '🏫',
    'Updated diary entry': '✏️',
    'Assigned student to parent': '👨‍👩‍👧',
    'Deleted user': '🗑️',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Track all system activity</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          Live Feed
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner text="Loading activity..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity recorded yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mt-0.5 flex-shrink-0">
                    {ACTION_ICONS[log.action] || '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{log.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">by {log.user}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {format(parseISO(log.timestamp), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(log.timestamp), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={fetchLogs}
            />
          </>
        )}
      </div>
    </div>
  );
}
