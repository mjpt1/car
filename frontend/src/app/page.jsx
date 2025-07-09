'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner'; // Assuming you have a Spinner component

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard'); // Redirect to dashboard if logged in
      } else {
        router.replace('/login'); // Redirect to login if not logged in
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show a loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // This content will likely not be seen due to redirects, but good as a fallback
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading application...</p>
    </div>
  );
}
