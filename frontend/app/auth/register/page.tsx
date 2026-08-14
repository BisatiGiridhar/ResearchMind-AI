'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, UserPlus, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      // Automatically log in
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 w-fit mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
          <p className="text-xs text-gray-400">Join the autonomous multi-agent research platform</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Alex Rivera"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@research.org"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
