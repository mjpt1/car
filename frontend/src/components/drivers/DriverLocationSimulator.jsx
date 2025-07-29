'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';

const locationSchema = z.object({
  tripId: z.coerce.number().int().positive("Trip ID is required."),
  lat: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  lng: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
});

const DriverLocationSimulator = () => {
  const socket = useSocket();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      lat: 35.70, // Default to a location in Tehran
      lng: 51.42,
    }
  });

  const onSubmit = (data) => {
    if (!socket || !socket.connected) {
      setError('root.serverError', {
        type: 'manual',
        message: 'Socket is not connected. Please ensure you are logged in.',
      });
      return;
    }

    console.log('Emitting driverLocationUpdate:', { tripId: data.tripId, location: { lat: data.lat, lng: data.lng } });
    socket.emit('driverLocationUpdate', {
      tripId: data.tripId,
      location: {
        lat: data.lat,
        lng: data.lng,
      },
    });
    // Note: We don't get a direct success/error response here unless we implement acknowledgements.
    // We can listen for a general 'error' event from the server if something goes wrong.
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>شبیه‌ساز موقعیت راننده (برای تست)</CardTitle>
        <CardDescription>
          این فرم برای تست ارسال موقعیت راننده است. در یک برنامه واقعی، این اطلاعات از GPS دستگاه راننده خوانده می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="tripId">شناسه سفر (Trip ID)</Label>
            <Input id="tripId" type="number" {...register('tripId')} className={errors.tripId ? 'border-red-500' : ''} />
            {errors.tripId && <p className="text-xs text-red-600 mt-1">{errors.tripId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">عرض جغرافیایی (Latitude)</Label>
              <Input id="lat" type="number" step="0.0001" {...register('lat')} className={errors.lat ? 'border-red-500' : ''} />
              {errors.lat && <p className="text-xs text-red-600 mt-1">{errors.lat.message}</p>}
            </div>
            <div>
              <Label htmlFor="lng">طول جغرافیایی (Longitude)</Label>
              <Input id="lng" type="number" step="0.0001" {...register('lng')} className={errors.lng ? 'border-red-500' : ''} />
              {errors.lng && <p className="text-xs text-red-600 mt-1">{errors.lng.message}</p>}
            </div>
          </div>
          {errors.root?.serverError && <p className="text-sm text-red-600 text-center">{errors.root.serverError.message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2" size="sm" />}
            ارسال موقعیت
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverLocationSimulator;
