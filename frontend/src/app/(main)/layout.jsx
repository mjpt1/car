'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
// import Navbar from '../../components/navigation/Navbar'; // Future Navbar
// import Sidebar from '../../components/navigation/Sidebar'; // Future Sidebar

export default function MainAppLayout({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // This state should ideally be brief as the redirect will occur.
    // Or, you might show a full-page "Redirecting to login..." message.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" />
            <p className="ml-4">Redirecting to login...</p>
        </div>
    );
  }

  // If authenticated, render the main layout
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar user={user} /> */}
      <div className="flex flex-1">
        {/* <Sidebar /> */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-brand-background">
          {/* Temporary Welcome Message - Can be removed or placed in Navbar */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.phoneNumber || 'User'}! (Main Layout)
            </h1>
          </div>
          {children}
        </main>
      </div>
      {/* Optional Footer can go here */}
    </div>
  );
}
