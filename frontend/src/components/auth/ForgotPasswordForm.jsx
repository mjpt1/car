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
import Link from 'next/link';

const requestOtpSchema = z.object({
  phone_number: z.string().min(10, "شماره موبایل معتبر نیست").regex(/^(\+98|0)?9\d{9}$/, "فرمت شماره موبایل صحیح نیست (مثال: 09123456789)"),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "رمز عبور جدید باید حداقل ۸ کاراکتر باشد"),
  confirmNewPassword: z.string().min(8, "تکرار رمز عبور باید حداقل ۸ کاراکتر باشد"),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "رمز عبور جدید و تکرار آن یکسان نیستند",
  path: ["confirmNewPassword"],
});


const ForgotPasswordForm = () => {
  const {
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    error: authError,
    clearError,
    loading: authLoading
  } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: request OTP, 2: verify OTP, 3: set new password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const formRequestOtp = useForm({ resolver: zodResolver(requestOtpSchema) });
  const formVerifyOtp = useForm({ resolver: zodResolver(verifyOtpSchema) });
  const formResetPassword = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const handleRequestOtp = async (data) => {
    clearError();
    setFormMessage({ type: '', text: '' });
    const result = await requestPasswordResetOtp(data.phone_number);
    if (result.success) {
      setPhoneNumber(data.phone_number);
      setStep(2);
      setFormMessage({ type: 'success', text: `کد تایید به شماره ${data.phone_number} ارسال شد. (کد تست: ${result.otpForTesting})` });
    } else {
      setFormMessage({ type: 'error', text: result.message || 'خطا در ارسال کد تایید.' });
    }
  };

  const handleVerifyOtp = async (data) => {
    clearError();
    setFormMessage({ type: '', text: '' });
    const result = await verifyPasswordResetOtp(phoneNumber, data.otp);
    if (result.success) {
      setOtp(data.otp);
      setStep(3);
      setFormMessage({ type: 'success', text: 'کد تایید شد. اکنون رمز عبور جدید را وارد کنید.' });
    } else {
      setFormMessage({ type: 'error', text: result.message || 'کد تایید نامعتبر یا منقضی شده است.' });
    }
  };

  const handleResetPassword = async (data) => {
    clearError();
    setFormMessage({ type: '', text: '' });
    const result = await resetPassword(phoneNumber, otp, data.newPassword);
    if (result.success) {
      setFormMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید با رمز جدید وارد شوید.' });
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setFormMessage({ type: 'error', text: result.message || 'خطا در تغییر رمز عبور.' });
    }
  };


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-brand-primary">بازیابی رمز عبور</CardTitle>
        <CardDescription>
          {step === 1 && 'شماره موبایل خود را برای دریافت کد تایید وارد کنید.'}
          {step === 2 && `کد ارسال شده به شماره ${phoneNumber} را وارد کنید.`}
          {step === 3 && 'رمز عبور جدید خود را تنظیم کنید.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formMessage.text && (
          <p className={`mb-4 text-sm text-center ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {formMessage.text}
          </p>
        )}
        {authError && !formMessage.text && <p className="mb-4 text-sm text-red-600 text-center">{authError}</p>}

        {step === 1 && (
          <form onSubmit={formRequestOtp.handleSubmit(handleRequestOtp)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone_number_forgot">شماره موبایل</Label>
              <Input
                id="phone_number_forgot"
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                {...formRequestOtp.register('phone_number')}
                className={formRequestOtp.formState.errors.phone_number ? 'border-red-500' : ''}
              />
              {formRequestOtp.formState.errors.phone_number && <p className="text-xs text-red-600 mt-1">{formRequestOtp.formState.errors.phone_number.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg" disabled={formRequestOtp.formState.isSubmitting || authLoading}>
              {formRequestOtp.formState.isSubmitting || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
              ارسال کد تایید
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={formVerifyOtp.handleSubmit(handleVerifyOtp)} className="space-y-6">
             <p className="text-sm text-center text-gray-700">
              کد تایید برای <span className="font-semibold text-brand-primary">{phoneNumber}</span> ارسال شد.
              <button onClick={() => { setStep(1); setFormMessage({type: '', text: ''}); clearError(); }} className="text-xs text-blue-500 hover:underline ml-2">(تغییر شماره؟)</button>
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp_forgot">کد تایید (OTP)</Label>
              <Input
                id="otp_forgot"
                type="text"
                dir="ltr"
                maxLength={6}
                placeholder="------"
                {...formVerifyOtp.register('otp')}
                className={`tracking-[0.3em] text-center ${formVerifyOtp.formState.errors.otp ? 'border-red-500' : ''}`}
              />
              {formVerifyOtp.formState.errors.otp && <p className="text-xs text-red-600 mt-1">{formVerifyOtp.formState.errors.otp.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg" disabled={formVerifyOtp.formState.isSubmitting || authLoading}>
              {formVerifyOtp.formState.isSubmitting || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
              تایید کد
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={formResetPassword.handleSubmit(handleResetPassword)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">رمز عبور جدید</Label>
              <Input
                id="newPassword"
                type="password"
                dir="ltr"
                placeholder="حداقل ۸ کاراکتر"
                {...formResetPassword.register('newPassword')}
                className={formResetPassword.formState.errors.newPassword ? 'border-red-500' : ''}
              />
              {formResetPassword.formState.errors.newPassword && <p className="text-xs text-red-600 mt-1">{formResetPassword.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">تکرار رمز عبور جدید</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                dir="ltr"
                placeholder="تکرار رمز عبور جدید"
                {...formResetPassword.register('confirmNewPassword')}
                className={formResetPassword.formState.errors.confirmNewPassword ? 'border-red-500' : ''}
              />
              {formResetPassword.formState.errors.confirmNewPassword && <p className="text-xs text-red-600 mt-1">{formResetPassword.formState.errors.confirmNewPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg" disabled={formResetPassword.formState.isSubmitting || authLoading}>
              {formResetPassword.formState.isSubmitting || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
              تغییر رمز عبور
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-gray-600">
          بازگشت به صفحه{' '}
          <Link href="/login" passHref>
            <span className="font-medium text-brand-primary hover:underline cursor-pointer">ورود</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
