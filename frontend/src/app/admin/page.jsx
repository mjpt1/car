'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '../../components/ui/Spinner';

// This page just acts as a redirector to the main admin dashboard
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <Spinner size="lg" />
      <p className="ml-4">در حال انتقال به داشبورد ادمین...</p>
    </div>
  );
}
