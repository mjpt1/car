'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For App Router
import { useAuth } from '../../../contexts/AuthContext';
import { getTripDetails } from '../../../lib/services/tripService';
import { createBooking } from '../../../lib/services/bookingService';
import { requestPayment } from '../../../lib/services/paymentService';
import SeatPicker from '../../../components/trips/SeatPicker';
import Spinner from '../../../components/ui/Spinner';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { AlertCircle, CheckCircle2, CreditCard, MapPin, Clock, UserCircle, Users, Truck, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatBox from '../../../components/chat/ChatBox';

const LiveTripMap = dynamic(() => import('../../../components/trips/LiveTripMap'), {
  ssr: false,
  loading: () => <p className="text-center p-4">در حال بارگذاری نقشه...</p>,
});


export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId;
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [tripDetails, setTripDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For booking/payment process
  const [pageError, setPageError] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null); // To store successful booking info

  const fetchTripData = useCallback(async () => {
    if (!tripId) {
        setPageError("شناسه سفر نامعتبر است.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setPageError('');
    try {
      const data = await getTripDetails(tripId);
      setTripDetails(data);
    } catch (err) {
      console.error("Failed to fetch trip details:", err);
      setPageError(err.message || 'خطا در دریافت اطلاعات سفر.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prevSelected => {
      const isAlreadySelected = prevSelected.find(s => s.id === seat.id);
      if (isAlreadySelected) {
        return prevSelected.filter(s => s.id !== seat.id);
      } else {
        return [...prevSelected, seat];
      }
    });
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/trips/${tripId}`);
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('لطفاً حداقل یک صندلی انتخاب کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingData = {
        trip_id: parseInt(tripId, 10),
        seat_ids: selectedSeats.map(s => s.id),
      };
      const result = await createBooking(bookingData);
      setBookingInfo(result); // Save booking info
      toast.success(`رزرو شما با موفقیت ثبت شد (شماره رزرو: ${result.booking_id}). لطفاً پرداخت را تکمیل کنید.`);
      // Don't redirect, show payment button instead
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.message || 'خطا در ثبت رزرو. ممکن است صندلی‌ها توسط کاربر دیگری رزرو شده باشند.');
      fetchTripData(); // Refresh seats status
      setSelectedSeats([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!bookingInfo) return;
    setIsSubmitting(true);
    try {
        const paymentResult = await requestPayment(bookingInfo.booking_id);
        // Redirect user to the payment gateway
        window.location.href = paymentResult.payment_url;
    } catch (err) {
        toast.error(err.message || 'خطا در ایجاد درخواست پرداخت.');
        setIsSubmitting(false);
    }
  };

  const totalBookingPrice = selectedSeats.reduce((total, seat) => total + parseFloat(seat.price), 0);

  const formatTime = (dateTime) => dateTime ? new Date(dateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'نامشخص';
  const formatDate = (dateTime) => dateTime ? new Date(dateTime).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'نامشخص';

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner size="lg" /></div>;
  }

  if (pageError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600 bg-red-50 p-6 rounded-md"><AlertCircle size={48} className="mx-auto mb-2"/>{pageError}</div>;
  }

  if (!tripDetails) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-500">اطلاعات سفر یافت نشد.</div>;
  }

  const driverName = `${tripDetails.driver_first_name || ''} ${tripDetails.driver_last_name || 'راننده شرکت'}`.trim();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-brand-primary flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span>سفر از {tripDetails.origin_location} به {tripDetails.destination_location}</span>
            <span className="text-lg sm:text-xl text-gray-600 mt-1 sm:mt-0">
              {formatDate(tripDetails.departure_time)}
            </span>
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            موقعیت لحظه‌ای راننده را روی نقشه دنبال کرده و صندلی(های) خود را انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {/* Live Map Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">موقعیت لحظه‌ای راننده</h3>
                <div className="h-[400px] w-full rounded-lg overflow-hidden border">
                    <LiveTripMap tripDetails={tripDetails} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Seat Picker and Chat */}
                <div className="lg:col-span-3 space-y-8">
                    <SeatPicker
                        tripDetails={tripDetails}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
                    {isAuthenticated && (
                        <div>
                             <h3 className="text-xl font-semibold mb-3">گفتگو با راننده و سایر مسافران</h3>
                            <ChatBox tripId={parseInt(tripId, 10)} />
                        </div>
                    )}
                </div>

                 {/* Right Column: Trip Info and Booking Summary */}
                 <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">اطلاعات سفر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center"><MapPin size={16} className="ml-2 text-brand-secondary"/><strong>مبدا:</strong> {tripDetails.origin_location}</p>
                <p className="flex items-center"><MapPin size={16} className="ml-2 text-brand-secondary"/><strong>مقصد:</strong> {tripDetails.destination_location}</p>
                <p className="flex items-center"><Clock size={16} className="ml-2 text-brand-secondary"/><strong>حرکت:</strong> {formatTime(tripDetails.departure_time)}</p>
                <p className="flex items-center"><Clock size={16} className="ml-2 text-brand-secondary"/><strong>رسیدن (تخمینی):</strong> {formatTime(tripDetails.estimated_arrival_time)}</p>
                <p className="flex items-center"><UserCircle size={16} className="ml-2 text-brand-secondary"/><strong>راننده:</strong> {driverName}</p>
                <p className="flex items-center"><Truck size={16} className="ml-2 text-brand-secondary"/><strong>خودرو:</strong> {tripDetails.driver_vehicle_details?.model || 'استاندارد'}</p>
                <p className="flex items-center"><Users size={16} className="ml-2 text-brand-secondary"/><strong>ظرفیت اولیه:</strong> {tripDetails.available_seats === undefined || tripDetails.available_seats === null ? 'نامشخص' : tripDetails.available_seats}</p>
                <p className="flex items-center"><Tag size={16} className="ml-2 text-brand-secondary"/><strong>قیمت پایه هر صندلی:</strong> {tripDetails.base_seat_price ? parseFloat(tripDetails.base_seat_price).toLocaleString('fa-IR') : 'نامشخص'} تومان</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">خلاصه رزرو</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSeats.length > 0 ? (
                  <ul className="space-y-1 text-sm mb-3">
                    {selectedSeats.map(seat => (
                      <li key={seat.id} className="flex justify-between">
                        <span>صندلی: {seat.seat_number}</span>
                        <span>{parseFloat(seat.price).toLocaleString('fa-IR')} تومان</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">هنوز صندلی انتخاب نشده است.</p>
                )}
                <div className="border-t pt-3">
                  <p className="flex justify-between font-semibold text-md">
                    <span>جمع کل:</span>
                    <span>{totalBookingPrice.toLocaleString('fa-IR')} تومان</span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-3">
                          {bookingInfo ? (
                            <div className="w-full text-center">
                               <div className="p-3 rounded-md text-sm w-full text-center bg-green-100 text-green-700 mb-3">
                                  <CheckCircle2 className="inline ml-2"/>
                                  رزرو شما با موفقیت ثبت شد. برای نهایی کردن، لطفاً پرداخت را انجام دهید.
                               </div>
                                <Button onClick={handleProceedToPayment} disabled={isSubmitting} className="w-full text-lg">
                                    {isSubmitting ? <Spinner className="ml-2" size="sm"/> : <CreditCard className="ml-2" size={20}/>}
                                    پرداخت نهایی
                                </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                  onClick={handleBooking}
                                  disabled={selectedSeats.length === 0 || isSubmitting}
                                  className="w-full text-lg"
                              >
                                  {isSubmitting ? <Spinner className="ml-2" size="sm"/> : <CheckCircle2 className="ml-2" size={20}/>}
                                  {isAuthenticated ? 'تایید و ثبت اولیه' : 'ورود برای ثبت رزرو'}
                              </Button>
                              {!isAuthenticated && <p className="text-xs text-center text-gray-500">برای تکمیل رزرو باید وارد حساب خود شوید.</p>}
                            </>
                          )}
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
