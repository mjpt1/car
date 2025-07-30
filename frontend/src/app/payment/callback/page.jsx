'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId = searchParams.get('transaction_id');
  const isMock = searchParams.get('mock');

  if (!isMock || !transactionId) {
    // This page is only for the mock flow. In a real scenario, the user would be at the gateway's page.
    // We can redirect them or show an error.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>صفحه نامعتبر</CardTitle>
          </CardHeader>
          <CardContent>
            <p>این صفحه بخشی از شبیه‌سازی پرداخت است و نباید مستقیماً به آن دسترسی پیدا کرد.</p>
            <Button onClick={() => router.push('/')} className="mt-4">بازگشت به صفحه اصلی</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const backendVerifyUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  const handlePaymentSimulation = (status) => {
    const verifyUrl = `${backendVerifyUrl}/payments/verify?transaction_id=${transactionId}&status=${status}`;
    // Redirect the browser to the backend verification URL
    window.location.href = verifyUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">شبیه‌ساز درگاه پرداخت</CardTitle>
          <CardDescription className="text-gray-600">
            این یک صفحه شبیه‌سازی شده است. در یک برنامه واقعی، شما به صفحه درگاه پرداخت بانکی هدایت می‌شوید.
            <br />
            شناسه تراکنش شما: <strong>{transactionId}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-lg">لطفاً نتیجه پرداخت را انتخاب کنید:</p>
          <div className="flex justify-center space-x-6 rtl:space-x-reverse">
            <Button
              onClick={() => handlePaymentSimulation('success')}
              className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600 text-white"
            >
              پرداخت موفق
            </Button>
            <Button
              onClick={() => handlePaymentSimulation('failure')}
              variant="destructive"
              className="text-lg px-8 py-6"
            >
              پرداخت ناموفق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
