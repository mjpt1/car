'use client';

import React from 'react';
import BookingCard from '../bookings/BookingCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Link from 'next/link';
import Button from '../ui/Button';

const UpcomingBookings = ({ bookings, onCancelBooking }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>رزروهای آینده</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          <p>شما هیچ رزرو فعالی برای آینده ندارید.</p>
          <Link href="/" passHref>
            <Button variant="link" className="mt-2">یک سفر جدید جستجو کنید</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Note: BookingCard needs to be adapted to include a cancel button or actions
  return (
    <Card>
      <CardHeader>
        <CardTitle>رزروهای آینده</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map(booking => (
          <BookingCard key={booking.booking_id} booking={booking} onCancel={onCancelBooking} />
        ))}
      </CardContent>
    </Card>
  );
};

export default UpcomingBookings;
