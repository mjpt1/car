'use client';

import React from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import { Users, Car, Map as MapIcon } from 'lucide-react';
// In a real scenario, you would fetch these stats from an admin dashboard API
// For now, these are placeholders.

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">داشبورد مدیریت</h1>
        <p className="text-gray-600 mt-1">نمای کلی از وضعیت سیستم.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="تعداد کل کاربران"
          value="150" // Placeholder
          icon={Users}
          description="تعداد کل کاربران ثبت‌نام شده"
        />
        <StatCard
          title="تعداد کل رانندگان"
          value="25" // Placeholder
          icon={Car}
          description="رانندگان تایید شده و در انتظار تایید"
        />
        <StatCard
          title="تعداد کل سفرها"
          value="300" // Placeholder
          icon={MapIcon}
          description="تعداد کل سفرهای ثبت شده در سیستم"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700">فعالیت‌های اخیر</h2>
        <div className="p-8 mt-4 bg-white rounded-lg shadow text-center text-gray-500">
          <p>(بخش گزارش وقایع و فعالیت‌های اخیر در اینجا نمایش داده خواهد شد)</p>
        </div>
      </div>
    </div>
  );
}
