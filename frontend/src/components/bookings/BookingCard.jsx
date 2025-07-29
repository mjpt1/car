'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { CalendarDays, Clock, DollarSign, MapPin, Ticket, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button'; // For potential cancel button later

const BookingCard = ({ booking }) => {
  if (!booking) return null;

  const formatTime = (dateTime) => dateTime ? new Date(dateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'نامشخص';
  const formatDate = (dateTime) => dateTime ? new Date(dateTime).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'نامشخص';

  const statusConfig = {
    pending_payment: { text: 'در انتظار پرداخت', color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={14} className="ml-1"/> },
    confirmed: { text: 'تایید شده', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} className="ml-1"/> },
    cancelled_by_user: { text: 'لغو شده توسط شما', color: 'text-red-600 bg-red-50', icon: <AlertTriangle size={14} className="ml-1"/> },
    cancelled_by_system: { text: 'لغو شده توسط سیستم', color: 'text-red-600 bg-red-50', icon: <AlertTriangle size={14} className="ml-1"/> },
    completed: { text: 'انجام شده', color: 'text-blue-600 bg-blue-50', icon: <CheckCircle size={14} className="ml-1"/> },
    // Add more statuses as needed
    default: { text: booking.booking_status, color: 'text-gray-600 bg-gray-50', icon: null }
  };

  const currentStatus = statusConfig[booking.booking_status] || statusConfig.default;
  const driverName = `${booking.driver_first_name || ''} ${booking.driver_last_name || 'راننده شرکت'}`.trim();


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-lg text-brand-primary mb-1 sm:mb-0">
              رزرو #{booking.booking_id} : {booking.origin_location} به {booking.destination_location}
            </CardTitle>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${currentStatus.color}`}>
                {currentStatus.icon}
                {currentStatus.text}
            </div>
        </div>
        <CardDescription className="text-xs text-gray-500 mt-1">
          تاریخ رزرو: {formatDate(booking.booking_time)} - {formatTime(booking.booking_time)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <p className="flex items-center"><CalendarDays size={14} className="ml-2 text-brand-secondary"/><strong>تاریخ سفر:</strong> {formatDate(booking.departure_time)}</p>
            <p className="flex items-center"><Clock size={14} className="ml-2 text-brand-secondary"/><strong>ساعت حرکت:</strong> {formatTime(booking.departure_time)}</p>
            <p className="flex items-center col-span-1 sm:col-span-2"><MapPin size={14} className="ml-2 text-brand-secondary"/><strong>راننده:</strong> {driverName}</p>
        </div>

        {booking.booked_seats_details && booking.booked_seats_details.length > 0 && (
          <div className="pt-2">
            <p className="font-medium mb-1 text-gray-700 flex items-center"><Ticket size={14} className="ml-2 text-brand-secondary"/>صندلی‌های رزرو شده:</p>
            <ul className="list-disc list-inside pl-4 rtl:pr-4 rtl:pl-0 text-gray-600">
              {booking.booked_seats_details.map(seat => (
                <li key={seat.seat_id}>
                  شماره صندلی: <span className="font-semibold">{seat.seat_number}</span> - قیمت: {parseFloat(seat.price).toLocaleString('fa-IR')} تومان
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
             <p className="flex items-center font-semibold text-md text-green-700">
                <DollarSign size={16} className="ml-2"/>
                مبلغ کل پرداخت شده: {parseFloat(booking.total_amount).toLocaleString('fa-IR')} تومان
            </p>
        </div>
      </CardContent>
      {/* Footer can be used for actions like "Cancel Booking" or "View Details" if a separate detail page exists */}
      {/* <CardFooter>
        {booking.booking_status === 'confirmed' && (
            <Button variant="destructive" size="sm" onClick={() => alert('Cancel booking ' + booking.booking_id)}>لغو رزرو</Button>
        )}
      </CardFooter> */}
    </Card>
  );
};

export default BookingCard;
