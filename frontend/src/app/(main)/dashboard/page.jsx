'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardData } from '../../lib/services/userService';
import { getMyBookings } from '../../lib/services/bookingService'; // To get upcoming bookings list
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/dashboard/StatCard';
import UpcomingBookings from '../../components/dashboard/UpcomingBookings';
import { AlertCircle, Ticket, CheckSquare, Car, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user) {
        setIsLoading(true);
        setError('');
        try {
          // Fetch dashboard stats and upcoming bookings in parallel
          const [dashData, allBookings] = await Promise.all([
            getDashboardData(),
            getMyBookings()
          ]);

          setDashboardData(dashData);

          // Filter for upcoming bookings from the full list
          const upcoming = allBookings.filter(b =>
            (b.booking_status === 'confirmed' || b.booking_status === 'pending_payment') &&
            new Date(b.departure_time) > new Date()
          );
          setUpcomingBookings(upcoming);

        } catch (err) {
          console.error("Failed to fetch dashboard data:", err);
          setError(err.message || "خطا در دریافت اطلاعات داشبورد.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-600 bg-red-50 p-6 rounded-md shadow"><AlertCircle size={48} className="mx-auto mb-2"/>{error}</div>;
  }

  const { userInfo, passengerData, driverData } = dashboardData || {};

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">
          داشبورد کاربری
        </h1>
        <p className="text-gray-600 mt-1">
          خوش آمدید، {userInfo?.first_name || user?.phoneNumber || 'کاربر عزیز'}!
        </p>
      </header>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="سفرهای پیش رو (مسافر)"
          value={passengerData?.upcoming_bookings || 0}
          icon={Ticket}
          description="رزروهای تایید شده برای آینده"
        />
        <StatCard
          title="سفرهای تکمیل شده (مسافر)"
          value={passengerData?.completed_bookings || 0}
          icon={CheckSquare}
          description="تعداد کل سفرهایی که انجام داده‌اید"
        />
        <StatCard
          title="کل رزروها"
          value={passengerData?.total_bookings || 0}
          icon={Ticket}
        />
      </div>

      {/* Driver-specific Stats Section */}
      {driverData && (
        <div className="pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">داشبورد راننده</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="وضعیت رانندگی"
              value={driverData.driver_status === 'approved' ? 'تایید شده' : 'در انتظار تایید'}
              icon={driverData.driver_status === 'approved' ? UserCheck : UserX}
              description="وضعیت فعلی پروفایل رانندگی شما"
            />
            <StatCard
              title="سفرهای پیش رو (راننده)"
              value={driverData.upcoming_trips || 0}
              icon={Car}
              description="سفرهایی که برای شما برنامه‌ریزی شده"
            />
            <StatCard
              title="سفرهای تکمیل شده (راننده)"
              value={driverData.completed_trips || 0}
              icon={CheckSquare}
              description="تعداد کل سفرهایی که به پایان رسانده‌اید"
            />
          </div>
        </div>
      )}

      {/* Upcoming Bookings List */}
      <div>
        <UpcomingBookings bookings={upcomingBookings} />
        <div className="text-center mt-4">
            <Link href="/my-bookings" passHref>
                <Button variant="outline">مشاهده تمام رزروها</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
