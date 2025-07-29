'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyBookings, cancelBooking } from '../../lib/services/bookingService';
import BookingCard from '../../components/bookings/BookingCard';
import Spinner from '../../components/ui/Spinner';
import { AlertCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/shared/ConfirmModal';
import RatingForm from '../../components/shared/RatingForm';
import { toast } from 'react-toastify';

export default function MyBookingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
        setError('فرمت پاسخ لیست رزروها نامعتبر است.');
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(err.message || 'خطا در دریافت لیست رزروها.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
      setError("برای مشاهده رزروها، لطفاً ابتدا وارد شوید.");
    }
  }, [isAuthenticated, authLoading, fetchBookings]);

  // --- Cancel Modal Logic ---
  const handleCancelClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    setIsSubmitting(true);
    try {
      const result = await cancelBooking(selectedBookingId);
      toast.success(result.message || 'رزرو با موفقیت لغو شد.');
      fetchBookings(); // Refresh the list
    } catch (err) {
      toast.error(err.message || 'خطا در لغو رزرو.');
    } finally {
      setIsSubmitting(false);
      setIsCancelModalOpen(false);
      setSelectedBookingId(null);
    }
  };

  // --- Rating Modal Logic ---
  const handleRateClick = (tripId) => {
    setSelectedTripId(tripId);
    setIsRatingModalOpen(true);
  };

  const handleRatingSuccess = () => {
    setIsRatingModalOpen(false);
    setSelectedTripId(null);
    // Optionally refresh bookings to show that rating is done, if we add such a state
    toast.info("از بازخورد شما متشکریم!");
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner size="lg" /></div>;
  }

  return (
    <>
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="لغو رزرو"
        message="آیا از لغو این رزرو اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        confirmText="بله، لغو کن"
        isLoading={isSubmitting}
      />
      <RatingForm
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        tripId={selectedTripId}
        onRatingSuccess={handleRatingSuccess}
      />

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
              <BookingCard
                key={booking.booking_id}
                booking={booking}
                onCancelClick={handleCancelClick}
                onRateClick={handleRateClick}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
