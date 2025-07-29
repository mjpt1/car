'use client';

import React from 'react';
import Button from '../../../components/ui/Button';

// This is a placeholder page for trip management by admin.
// Functionality to be added: List trips, edit, delete, and create new trips.

export default function AdminTripsPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت سفرها</h1>
          <p className="text-gray-600 mt-1">ایجاد، ویرایش و حذف سفرهای سیستم.</p>
        </div>
        <Button>
          ایجاد سفر جدید
        </Button>
      </header>

      <div className="p-8 mt-4 bg-white rounded-lg shadow text-center text-gray-500">
        <p>(لیست سفرها با قابلیت جستجو، فیلتر و ویرایش در اینجا نمایش داده خواهد شد)</p>
      </div>
    </div>
  );
}
