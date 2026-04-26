import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, User, BookOpen, Clock, Edit2, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';

const TYPE_CONFIG = {
  homework: { label: 'Homework', variant: 'homework', icon: '📚' },
  announcement: { label: 'Announcement', variant: 'announcement', icon: '📢' },
  remark: { label: 'Remark', variant: 'remark', icon: '💬' },
};

export default function DiaryCard({ entry, onEdit, onDelete, showActions = false }) {
  const typeConfig = TYPE_CONFIG[entry.type] || TYPE_CONFIG.announcement;

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{typeConfig.icon}</span>
          <Badge variant={entry.type}>{typeConfig.label}</Badge>
          {entry.subject_name && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {entry.subject_name}
            </span>
          )}
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
        {entry.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {entry.description}
      </p>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
        {entry.teacher_name && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {entry.teacher_name}
          </span>
        )}
        {entry.class_name && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {entry.class_name}
          </span>
        )}
        {entry.student_name && (
          <span className="flex items-center gap-1 text-purple-500">
            <User className="w-3 h-3" />
            {entry.student_name}
          </span>
        )}
        {entry.due_date && (
          <span className="flex items-center gap-1 text-orange-500 font-medium">
            <Calendar className="w-3 h-3" />
            Due: {formatDate(entry.due_date)}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {formatDate(entry.created_at)}
        </span>
      </div>
    </div>
  );
}
