'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';

const profileSchema = z.object({
  first_name: z.string().max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد").optional().or(z.literal('')),
  last_name: z.string().max(100, "نام خانوادگی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد").optional().or(z.literal('')),
  email: z.string().email({ message: "ایمیل معتبر نیست" }).max(255).optional().or(z.literal('')),
});

const UserProfileForm = () => {
  const { user, loading: authLoading, loadUserFromToken } = useAuth(); // Assuming loadUserFromToken can refresh user state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUserData, setCurrentUserData] = useState(null);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { // Set default values once currentUserData is loaded
        first_name: '',
        last_name: '',
        email: '',
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && user.id) { // Check if user object and user.id exist
        setIsLoading(true);
        try {
          const response = await apiClient.get('/users/profile');
          setCurrentUserData(response.data);
          reset({ // Populate form with fetched data
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            email: response.data.email || '',
          });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          setMessage({ type: 'error', text: 'خطا در دریافت اطلاعات پروفایل.' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, reset]);


  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    const payload = {};
    if (data.first_name !== (currentUserData?.first_name || '')) payload.first_name = data.first_name;
    if (data.last_name !== (currentUserData?.last_name || '')) payload.last_name = data.last_name;
    if (data.email !== (currentUserData?.email || '')) payload.email = data.email;

    if (Object.keys(payload).length === 0 && !isDirty) {
        setMessage({ type: 'info', text: 'تغییری برای ذخیره وجود ندارد.'});
        setIsLoading(false);
        return;
    }


    try {
      const response = await apiClient.put('/users/profile', payload);
      setMessage({ type: 'success', text: 'پروفایل با موفقیت به‌روزرسانی شد.' });
      setCurrentUserData(response.data.user); // Update current user data
      // Optionally, refresh user in AuthContext if it holds more than just id/phone
      // For example, if AuthContext.user also stores name/email directly:
      // const token = Cookies.get('authToken'); if (token) loadUserFromToken(token);

    } catch (error) {
      console.error('Profile update failed:', error.response?.data?.message || error.message);
      setMessage({ type: 'error', text: error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && !currentUserData)) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اطلاعات کاربری</CardTitle>
        <CardDescription>اطلاعات شخصی خود را ویرایش کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        {message.text && (
          <p className={`mb-4 text-sm text-center p-2 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700' :
            message.type === 'success' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {message.text}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">نام</Label>
              <Input id="first_name" {...register('first_name')} className={errors.first_name ? 'border-red-500' : ''} />
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">نام خانوادگی</Label>
              <Input id="last_name" {...register('last_name')} className={errors.last_name ? 'border-red-500' : ''} />
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" dir="ltr" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
           <div className="space-y-2">
              <Label htmlFor="phone_number_display">شماره موبایل (غیرقابل تغییر)</Label>
              <Input id="phone_number_display" type="tel" dir="ltr" value={currentUserData?.phone_number || ''} disabled readOnly />
            </div>
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? <Spinner className="mr-2" size="sm" /> : null}
            ذخیره تغییرات
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
