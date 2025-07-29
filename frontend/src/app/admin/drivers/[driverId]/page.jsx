'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDriverDetails, updateDriverStatus, updateDocumentStatus } from '../../../lib/services/adminService';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { toast } from 'react-toastify';

const DocumentItem = ({ doc, onUpdateStatus }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState(doc.review_notes || '');

  const handleUpdate = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(doc.id, newStatus, notes);
      toast.success(`وضعیت مدرک به ${newStatus} تغییر یافت.`);
    } catch (error) {
      toast.error(error.message || 'خطا در تغییر وضعیت مدرک.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    approved: 'bg-green-100 text-green-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">{doc.document_type}</h4>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[doc.status]}`}>{doc.status}</span>
      </div>
      <p className="text-sm">نام فایل: <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.file_name}</a></p>
      <p className="text-sm">تاریخ بارگذاری: {new Date(doc.uploaded_at).toLocaleString('fa-IR')}</p>

      <div>
        <label className="text-xs text-gray-500">یادداشت بررسی (اختیاری):</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full mt-1 p-2 border rounded-md text-sm"
          placeholder="یادداشتی برای راننده بنویسید (مخصوصا در صورت رد مدرک)."
        />
      </div>

      <div className="flex space-x-2 rtl:space-x-reverse">
        <Button size="sm" variant="default" onClick={() => handleUpdate('approved')} disabled={isSubmitting || doc.status === 'approved'}>تایید</Button>
        <Button size="sm" variant="destructive" onClick={() => handleUpdate('rejected')} disabled={isSubmitting || doc.status === 'rejected'}>رد</Button>
        <Button size="sm" variant="outline" onClick={() => handleUpdate('pending_review')} disabled={isSubmitting || doc.status === 'pending_review'}>بازبینی مجدد</Button>
      </div>
    </div>
  );
};


export default function DriverDetailsPage() {
  const params = useParams();
  const driverId = params?.driverId;
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);
    try {
      const data = await getDriverDetails(driverId);
      setDriver(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch driver details.');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDriverStatusUpdate = async (newStatus) => {
    try {
        await updateDriverStatus(driverId, newStatus);
        toast.success(`وضعیت کلی راننده به ${newStatus} تغییر یافت.`);
        fetchDetails(); // Refresh data
    } catch(err) {
        toast.error(err.message || 'خطا در تغییر وضعیت راننده.');
    }
  }

  const handleDocumentStatusUpdate = async (documentId, status, notes) => {
     await updateDocumentStatus(documentId, status, notes);
     // We need to refresh the whole driver object to see the change
     fetchDetails();
  }


  if (isLoading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!driver) return <p className="text-center text-gray-500">راننده یافت نشد.</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">جزئیات راننده: {driver.first_name} {driver.last_name}</h1>
        <p className="text-gray-600 mt-1">ID: {driver.driver_id} - وضعیت فعلی: <span className="font-semibold">{driver.status}</span></p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>نام:</strong> {driver.first_name || '-'}</p>
          <p><strong>نام خانوادگی:</strong> {driver.last_name || '-'}</p>
          <p><strong>ایمیل:</strong> {driver.email || '-'}</p>
          <p><strong>موبایل:</strong> {driver.phone_number}</p>
          <p><strong>نقش:</strong> {driver.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>تغییر وضعیت کلی راننده</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => handleDriverStatusUpdate('approved')} disabled={driver.status === 'approved'}>تایید نهایی راننده</Button>
            <Button variant="destructive" onClick={() => handleDriverStatusUpdate('rejected')} disabled={driver.status === 'rejected'}>رد کردن راننده</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مدارک بارگذاری شده</CardTitle>
          <CardDescription>مدارک زیر توسط راننده ارسال شده است. لطفاً آنها را بررسی و تایید یا رد کنید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {driver.documents && driver.documents.length > 0 ? (
            driver.documents.map(doc => <DocumentItem key={doc.id} doc={doc} onUpdateStatus={handleDocumentStatusUpdate} />)
          ) : (
            <p className="text-gray-500">هیچ مدرکی بارگذاری نشده است.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
