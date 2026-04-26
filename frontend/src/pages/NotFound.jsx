import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
        <BookMarked className="w-10 h-10 text-primary-600" />
      </div>
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="btn-primary gap-2"
      >
        <Home className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}
