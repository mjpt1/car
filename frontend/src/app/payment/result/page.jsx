'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const ResultContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const success = searchParams.get('success') === 'true';
    const message = searchParams.get('message') || (success ? 'عملیات با موفقیت انجام شد.' : 'عملیات ناموفق بود.');
    const bookingId = searchParams.get('bookingId');

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-lg text-center shadow-xl">
                <CardHeader>
                    {success ? (
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    ) : (
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    )}
                    <CardTitle className={`text-2xl font-bold ${success ? 'text-green-600' : 'text-red-600'}`}>
                        {success ? 'پرداخت موفق' : 'پرداخت ناموفق'}
                    </CardTitle>
                    <CardDescription className="text-gray-600 pt-2">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-4">
                        {bookingId && (
                             <p className="text-sm">
                                برای مشاهده جزئیات رزرو خود (شماره {bookingId}) می‌توانید به صفحه "رزروهای من" مراجعه کنید.
                            </p>
                        )}
                        <Button onClick={() => router.push('/my-bookings')} className="w-full">
                            مشاهده رزروهای من
                        </Button>
                        <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                            بازگشت به صفحه اصلی
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Use Suspense as searchParams are only available client-side in App Router
export default function PaymentResultPage() {
    return (
        <Suspense fallback={<div>در حال بارگذاری نتیجه...</div>}>
            <ResultContent />
        </Suspense>
    );
}
