import React from 'react';

const VARIANTS = {
  homework: 'bg-blue-100 text-blue-700 ring-blue-200',
  announcement: 'bg-green-100 text-green-700 ring-green-200',
  remark: 'bg-purple-100 text-purple-700 ring-purple-200',
  admin: 'bg-red-100 text-red-700 ring-red-200',
  teacher: 'bg-blue-100 text-blue-700 ring-blue-200',
  student: 'bg-green-100 text-green-700 ring-green-200',
  parent: 'bg-purple-100 text-purple-700 ring-purple-200',
  success: 'bg-green-100 text-green-700 ring-green-200',
  warning: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  danger: 'bg-red-100 text-red-700 ring-red-200',
  info: 'bg-sky-100 text-sky-700 ring-sky-200',
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
};

export default function Badge({ variant = 'default', children, className = '' }) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
