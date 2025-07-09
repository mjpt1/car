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
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  confirmPassword: z.string().min(8, "تکرار رمز عبور باید حداقل ۸ کاراکتر باشد"),
}).refine(data => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن یکسان نیستند",
  path: ["confirmPassword"], // path of error
});

const RegisterForm = () => {
  const { requestOtpForRegister, verifyOtpAndRegister, error: authError, clearError, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 for OTP request, 2 for OTP verification and password
  const [phoneNumber, setPhoneNumber] = useState(''); // Store phone number for step 2
  const [formMessage, setFormMessage] = useState({ type: '', text: '' }); // For success/error messages

  const {
    register: registerRequestOtp,
    handleSubmit: handleSubmitRequestOtp,
    formState: { errors: errorsRequestOtp, isSubmitting: isSubmittingRequestOtp },
    getValues: getValuesRequestOtp,
  } = useForm({
    resolver: zodResolver(requestOtpSchema),
  });

  const {
    register: registerVerifyOtp,
    handleSubmit: handleSubmitVerifyOtp,
    formState: { errors: errorsVerifyOtp, isSubmitting: isSubmittingVerifyOtp },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
  });

  const handleRequestOtp = async (data) => {
    clearError();
    setFormMessage({ type: '', text: '' });
    const result = await requestOtpForRegister(data.phone_number);
    if (result.success) {
      setPhoneNumber(data.phone_number);
      setStep(2);
      setFormMessage({ type: 'success', text: `کد تایید به شماره ${data.phone_number} ارسال شد. (کد تست: ${result.otpForTesting})` }); // Show OTP for testing
    } else {
      setFormMessage({ type: 'error', text: result.message || 'خطا در ارسال کد تایید.' });
    }
  };

  const handleVerifyOtpAndSetPassword = async (data) => {
    clearError();
    setFormMessage({ type: '', text: '' });
    const result = await verifyOtpAndRegister(phoneNumber, data.otp, data.password);
    if (result.success) {
      setFormMessage({ type: 'success', text: 'ثبت‌نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.' });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setFormMessage({ type: 'error', text: result.message || 'خطا در ثبت‌نام.' });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-brand-primary">ایجاد حساب کاربری</CardTitle>
        <CardDescription>
          {step === 1 ? 'شماره موبایل خود را برای دریافت کد تایید وارد کنید.' : 'کد تایید و رمز عبور جدید را وارد کنید.'}
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
          <form onSubmit={handleSubmitRequestOtp(handleRequestOtp)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone_number_register">شماره موبایل</Label>
              <Input
                id="phone_number_register"
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                {...registerRequestOtp('phone_number')}
                className={errorsRequestOtp.phone_number ? 'border-red-500' : ''}
              />
              {errorsRequestOtp.phone_number && <p className="text-xs text-red-600 mt-1">{errorsRequestOtp.phone_number.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg" disabled={isSubmittingRequestOtp || authLoading}>
              {isSubmittingRequestOtp || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
              دریافت کد تایید
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitVerifyOtp(handleVerifyOtpAndSetPassword)} className="space-y-6">
            <p className="text-sm text-center text-gray-700">
              کد تایید برای <span className="font-semibold text-brand-primary">{phoneNumber}</span> ارسال شد.
              <button onClick={() => { setStep(1); setFormMessage({type: '', text: ''}); clearError(); }} className="text-xs text-blue-500 hover:underline ml-2">(تغییر شماره؟)</button>
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp">کد تایید (OTP)</Label>
              <Input
                id="otp"
                type="text" // text for easier input, can be number
                dir="ltr"
                maxLength={6}
                placeholder="------"
                {...registerVerifyOtp('otp')}
                className={`tracking-[0.3em] text-center ${errorsVerifyOtp.otp ? 'border-red-500' : ''}`}
              />
              {errorsVerifyOtp.otp && <p className="text-xs text-red-600 mt-1">{errorsVerifyOtp.otp.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_register">رمز عبور</Label>
              <Input
                id="password_register"
                type="password"
                dir="ltr"
                placeholder="حداقل ۸ کاراکتر"
                {...registerVerifyOtp('password')}
                className={errorsVerifyOtp.password ? 'border-red-500' : ''}
              />
              {errorsVerifyOtp.password && <p className="text-xs text-red-600 mt-1">{errorsVerifyOtp.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <Input
                id="confirmPassword"
                type="password"
                dir="ltr"
                placeholder="تکرار رمز عبور"
                {...registerVerifyOtp('confirmPassword')}
                className={errorsVerifyOtp.confirmPassword ? 'border-red-500' : ''}
              />
              {errorsVerifyOtp.confirmPassword && <p className="text-xs text-red-600 mt-1">{errorsVerifyOtp.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg" disabled={isSubmittingVerifyOtp || authLoading}>
              {isSubmittingVerifyOtp || authLoading ? <Spinner className="mr-2" size="sm" /> : null}
              ثبت نام و ایجاد حساب
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-gray-600">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" passHref>
            <span className="font-medium text-brand-primary hover:underline cursor-pointer">وارد شوید</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
