'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyBookings } from '../../lib/services/bookingService';
import BookingCard from '../../components/bookings/BookingCard';
import Spinner from '../../components/ui/Spinner';
import { AlertCircle, ShoppingBag } from 'lucide-react'; // Icon for no bookings
import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function MyBookingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setIsLoading(true);
      setError('');
      getMyBookings()
        .then(data => {
          if (Array.isArray(data)) {
            setBookings(data);
          } else if (data && data.bookings) { // Handle backend returning { message, bookings }
            setBookings(data.bookings);
             if (data.bookings.length === 0 && data.message) {
                // setError(data.message); // Or just let the "no bookings" UI handle it
            }
          } else {
            setBookings([]);
            setError('فرمت پاسخ لیست رزروها نامعتبر است.');
          }
        })
        .catch(err => {
          console.error("Failed to fetch bookings:", err);
          setError(err.message || 'خطا در دریافت لیست رزروها.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading && !isAuthenticated) {
      // This page should be protected by MainAppLayout, so user should be redirected.
      // However, as a fallback:
      setIsLoading(false);
      setError("برای مشاهده رزروها، لطفاً ابتدا وارد شوید.");
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">رزروهای من</h1>
        <p className="text-gray-600 mt-1">تاریخچه سفرهای رزرو شده شما در اینجا نمایش داده می‌شود.</p>
      </header>

      {error && (
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-md shadow">
            <AlertCircle size={48} className="mx-auto mb-2"/>
            {error}
            {!isAuthenticated && (
                <Link href="/login?redirect=/my-bookings" className="mt-4 block">
                    <Button variant="outline">ورود به حساب کاربری</Button>
                </Link>
            )}
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-lg shadow">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">شما هنوز هیچ رزروی انجام نداده‌اید.</h2>
          <p className="mb-6">برای شروع، یک سفر جستجو کرده و صندلی مورد نظر خود را رزرو کنید.</p>
          <Link href="/" passHref>
            <Button variant="default" size="lg">جستجوی سفر</Button>
          </Link>
        </div>
      )}

      {!error && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map(booking => (
            <BookingCard key={booking.booking_id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
