'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../lib/apiClient';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';

const applicationSchema = z.object({
  // For now, no specific fields are mandatory for the initial application via UI
  // Vehicle details can be added later or made optional here
  vehicle_model: z.string().optional(),
  vehicle_plate_number: z.string().optional(),
  // Add more fields if they are part of the initial application data
});

const DriverApplicationForm = ({ onApplicationSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    // Construct payload, e.g. if vehicle details are collected
    const payload = {
        vehicle_details: (data.vehicle_model || data.vehicle_plate_number) ? { // Only include if some detail is provided
            model: data.vehicle_model,
            plate_number: data.vehicle_plate_number,
            // color: data.vehicle_color // if you add color
        } : null
    };
    if (!payload.vehicle_details) delete payload.vehicle_details; // Remove if null

    try {
      await apiClient.post('/drivers/apply', payload);
      setMessage({ type: 'success', text: 'درخواست شما برای راننده شدن با موفقیت ثبت شد. پس از بررسی با شما تماس گرفته خواهد شد.' });
      if (onApplicationSuccess) {
        onApplicationSuccess(); // Callback to update parent component state (e.g., refetch driver status)
      }
    } catch (error) {
      console.error('Driver application failed:', error.response?.data?.message || error.message);
      let errorMsg = 'خطا در ثبت درخواست رانندگی.';
      if (error.response?.status === 409) { // Conflict - already applied/is driver
        errorMsg = error.response?.data?.message || 'شما قبلاً درخواست داده‌اید یا در حال حاضر راننده هستید.';
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>درخواست فعالیت به عنوان راننده</CardTitle>
        <CardDescription>با تکمیل فرم زیر، درخواست خود را برای پیوستن به ناوگان ما ثبت کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        {message.text && (
          <p className={`mb-4 text-sm text-center p-2 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </p>
        )}
        {/* Optional: Add fields for vehicle details if needed at this stage */}
        {/* For example:
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="vehicle_model">مدل خودرو (اختیاری)</Label>
                <Input id="vehicle_model" {...register('vehicle_model')} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="vehicle_plate_number">شماره پلاک (اختیاری)</Label>
                <Input id="vehicle_plate_number" {...register('vehicle_plate_number')} />
            </div>
             <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? <Spinner className="mr-2" size="sm"/> : null}
                ارسال درخواست
            </Button>
        </form>
        */}
        <p className="text-gray-600 mb-4">
          پس از ارسال درخواست اولیه، همکاران ما با شما تماس خواهند گرفت و مراحل بعدی شامل بارگذاری مدارک به شما اطلاع داده خواهد شد.
        </p>
        <Button onClick={handleSubmit(onSubmit)} className="w-full" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? <Spinner className="mr-2" size="sm"/> : null}
          ارسال درخواست رانندگی
        </Button>
      </CardContent>
    </Card>
  );
};

export default DriverApplicationForm;
