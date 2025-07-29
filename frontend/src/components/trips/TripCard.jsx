'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Clock, MapPin, Users, Truck, UserCircle, Tag } from 'lucide-react';

const TripCard = ({ trip }) => {
  if (!trip) return null;

  const formatTime = (dateTime) => {
    if (!dateTime) return 'نامشخص';
    try {
      return new Date(dateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return 'نامشخص';
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'نامشخص';
     try {
      return new Date(dateTime).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'نامشخص';
    }
  }

  const driverName = `${trip.driver_first_name || ''} ${trip.driver_last_name || 'راننده شرکت'}`.trim();
  const vehicleModel = trip.vehicle_details?.model || 'خودروی استاندارد';


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl text-brand-primary flex items-center justify-between">
          <span>{trip.origin_location} به {trip.destination_location}</span>
          <span className="text-lg font-semibold text-green-600">
            {trip.base_seat_price?.toLocaleString('fa-IR')} تومان
          </span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          تاریخ حرکت: {formatDate(trip.departure_time)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm flex-grow">
        <div className="flex items-center text-gray-700">
          <Clock size={16} className="ml-2 text-brand-secondary" />
          <span>ساعت حرکت: {formatTime(trip.departure_time)}</span>
          <span className="mx-1">-</span>
          <span>ساعت تخمینی رسیدن: {formatTime(trip.estimated_arrival_time)}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <UserCircle size={16} className="ml-2 text-brand-secondary" />
          <span>راننده: {driverName}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Truck size={16} className="ml-2 text-brand-secondary" />
          <span>خودرو: {vehicleModel}</span>
        </div>
         <div className="flex items-center text-gray-700">
          <Users size={16} className="ml-2 text-brand-secondary" />
          <span>صندلی‌های خالی: {trip.actual_available_seats === undefined || trip.actual_available_seats === null ? 'N/A' : trip.actual_available_seats} عدد</span>
        </div>
        {trip.notes && (
          <p className="text-xs text-gray-500 border-t pt-2 mt-2">یادداشت: {trip.notes}</p>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/trips/${trip.id}`} passHref className="w-full">
          <Button className="w-full" variant="default">
            مشاهده جزئیات و انتخاب صندلی
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TripCard;
