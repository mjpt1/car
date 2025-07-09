'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Spinner from '../ui/Spinner';
import Link from 'next/link'; // For navigation links like "Forgot password?"

const loginSchema = z.object({
  phone_number: z.string().min(10, "شماره موبایل معتبر نیست").regex(/^(\+98|0)?9\d{9}$/, "فرمت شماره موبایل صحیح نیست (مثال: 09123456789)"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

const LoginForm = () => {
  const { login, error: authError, clearError, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState(''); // For general form errors not from AuthContext

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    clearError(); // Clear previous auth errors
    setFormError('');
    const success = await login(data.phone_number, data.password);
    if (success) {
      router.push('/dashboard'); // Redirect to dashboard on successful login
    } else {
      // AuthError will be set in AuthContext, or set a general message if needed
      // setFormError(authError || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-brand-primary">ورود به حساب</CardTitle>
        <CardDescription>برای دسترسی به پنل خود وارد شوید.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone_number">شماره موبایل</Label>
            <Input
              id="phone_number"
              type="tel"
              dir="ltr" // For phone number input
              placeholder="09123456789"
              {...register('phone_number')}
              className={errors.phone_number ? 'border-red-500' : ''}
            />
            {errors.phone_number && <p className="text-xs text-red-600 mt-1">{errors.phone_number.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">رمز عبور</Label>
              <Link href="/forgot-password" passHref>
                <span className="text-sm text-brand-primary hover:underline cursor-pointer">فراموشی رمز؟</span>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              dir="ltr" // For password input
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {authError && <p className="text-sm text-red-600 text-center">{authError}</p>}
          {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}

          <Button type="submit" className="w-full text-lg" disabled={isSubmitting || authLoading}>
            {isSubmitting || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
            ورود
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-gray-600">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" passHref>
            <span className="font-medium text-brand-primary hover:underline cursor-pointer">ثبت‌نام کنید</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
