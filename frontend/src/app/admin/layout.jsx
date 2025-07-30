'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/ui/Spinner';
import Sidebar from '../../components/admin/Sidebar';
import { AlertTriangle, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    if (typeof window !== 'undefined') {
        router.replace('/');
    }
    return (
         <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-600">
            <AlertTriangle size={48} className="mb-4"/>
            <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>
            <p className="mt-2 text-gray-700">شما اجازه دسترسی به این بخش را ندارید. در حال انتقال به صفحه اصلی...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for large screens */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}>
          <div className="relative flex-1 w-full max-w-xs flex flex-col bg-gray-800">
             <div className="absolute top-0 left-0 -ml-12 pt-2 rtl:right-0 rtl:-mr-12">
                 <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                     <X className="h-6 w-6 text-white" />
                 </button>
             </div>
              <Sidebar />
          </div>
          <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)}></div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar for mobile */}
        <header className="lg:hidden bg-white shadow-sm h-16 z-10 flex items-center justify-between px-4">
           <Link href="/admin/dashboard" className="font-bold text-lg text-brand-primary">پنل ادمین</Link>
           <button onClick={() => setSidebarOpen(true)}>
               <Menu className="h-6 w-6 text-gray-600" />
           </button>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
