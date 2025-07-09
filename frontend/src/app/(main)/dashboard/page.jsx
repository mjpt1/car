'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">داشبورد کاربری</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            سلام <span className="font-semibold text-brand-primary">{user?.phoneNumber || 'کاربر عزیز'}</span>، به پنل خود خوش آمدید!
          </p>
          <p className="mt-2 text-gray-600">
            اینجا صفحه داشبورد شماست. در آینده امکانات بیشتری به این بخش اضافه خواهد شد.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>پروفایل کاربری</CardTitle>
          </CardHeader>
          <CardContent>
            <p>اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید.</p>
            <Link href="/profile" passHref className="mt-4 block">
              <Button variant="outline">مشاهده و ویرایش پروفایل</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>بخش رانندگان</CardTitle>
          </CardHeader>
          <CardContent>
            <p>در صورت تمایل به عنوان راننده فعالیت کنید یا مدارک خود را مدیریت نمایید.</p>
            {/* TODO: Check if user is driver to show different options */}
            <Link href="/profile#driver-section" passHref className="mt-4 block">
              <Button variant="outline">مدیریت پروفایل راننده</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button onClick={logout} variant="destructive">
          خروج از حساب کاربری
        </Button>
      </div>
    </div>
  );
}
