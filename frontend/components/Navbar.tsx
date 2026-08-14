'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, PlusCircle, History, FileText, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Research<span className="text-indigo-400">AI</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Dashboard
          </Link>
          <Link href="/research/new" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            New Research
          </Link>
          <Link href="/history" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            <History className="w-4 h-4 text-purple-400" />
            History
          </Link>
          <Link href="/documents" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
            <FileText className="w-4 h-4 text-emerald-400" />
            Documents
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {token ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
