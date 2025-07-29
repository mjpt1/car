'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/ui/Spinner';
import Sidebar from '../../components/admin/Sidebar';
import { AlertTriangle } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated or not an admin, redirect or show error
  if (!isAuthenticated || user?.role !== 'admin') {
    // Redirect to home or login page after a short delay to prevent flashing
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

  // Render the admin layout for authenticated admins
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: Add a header bar here */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
