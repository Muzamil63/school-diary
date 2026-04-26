import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { DEMO_CREDENTIALS } from '../data/mockData';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const ROLE_REDIRECTS = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROLE_REDIRECTS[user.role] || '/login', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const cred = DEMO_CREDENTIALS[role];
    if (!cred) return;
    setForm({ email: cred.email, password: cred.password });
    setLoading(true);
    try {
      const user = await login(cred.email, cred.password);
      toast.success(`Logged in as ${user.name}`);
      navigate(ROLE_REDIRECTS[user.role], { replace: true });
    } catch {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <BookMarked className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            School Diary<br />
            <span className="text-primary-300">System</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Connecting teachers, students, and parents through seamless academic communication.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: '📚', title: 'Homework Tracking', desc: 'Never miss an assignment' },
              { icon: '📢', title: 'Announcements', desc: 'Stay informed always' },
              { icon: '💬', title: 'Remarks System', desc: 'Personal student feedback' },
              { icon: '👨‍👩‍👧', title: 'Parent Access', desc: 'Monitor child\'s progress' },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-2xl">{f.icon}</span>
                <p className="font-semibold mt-2 text-sm">{f.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">School Diary</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    setErrors((er) => ({ ...er, email: '' }));
                  }}
                  placeholder="you@school.edu"
                  className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, password: e.target.value }));
                      setErrors((er) => ({ ...er, password: '' }));
                    }}
                    placeholder="••••••••"
                    className={`input-field pr-10 ${errors.password ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-11 text-sm font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo credentials */}
            {isDemoMode && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">DEMO QUICK LOGIN</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'admin', label: 'Admin', color: 'border-red-200 hover:bg-red-50 text-red-700' },
                    { role: 'teacher', label: 'Teacher', color: 'border-blue-200 hover:bg-blue-50 text-blue-700' },
                    { role: 'student', label: 'Student', color: 'border-green-200 hover:bg-green-50 text-green-700' },
                    { role: 'parent', label: 'Parent', color: 'border-purple-200 hover:bg-purple-50 text-purple-700' },
                  ].map(({ role, label, color }) => (
                    <button
                      key={role}
                      onClick={() => quickLogin(role)}
                      disabled={loading}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Click a role to auto-fill demo credentials
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            © {new Date().getFullYear()} School Diary System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
