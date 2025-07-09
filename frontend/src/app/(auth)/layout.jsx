'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';

export default function AuthLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  // Do not render children if authenticated and redirecting
  if (isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Spinner size="lg" />
            <p className="ml-4">Redirecting to dashboard...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary to-blue-700 p-4">
      {/* You can add a logo here if needed */}
      {/* <img src="/logo.png" alt="Logo" className="mb-8 h-16 w-auto" /> */}
      {children}
    </div>
  );
}
