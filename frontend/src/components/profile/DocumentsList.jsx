'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../lib/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import { Badge } from '../ui/Badge'; // Assuming you'll create a Badge component

// Placeholder for Badge component if not created yet
const PlaceholderBadge = ({ children, variant, className }) => {
    let bgColor = 'bg-gray-200 text-gray-700'; // default
    if (variant === 'success') bgColor = 'bg-green-100 text-green-700';
    if (variant === 'warning') bgColor = 'bg-yellow-100 text-yellow-700';
    if (variant === 'destructive') bgColor = 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${bgColor} ${className}`}>{children}</span>;
};


const DOCUMENT_TYPE_LABELS = {
  license: 'گواهینامه رانندگی',
  vehicle_registration: 'کارت ماشین',
  insurance: 'بیمه‌نامه شخص ثالث',
  national_id: 'کارت ملی',
  // Add other document types as needed
};

const STATUS_LABELS_COLORS = {
    pending_review: { label: 'در انتظار بررسی', color: 'warning' },
    approved: { label: 'تایید شده', color: 'success' },
    rejected: { label: 'رد شده', color: 'destructive' },
};


const DocumentsList = ({ driverId, refreshTrigger }) => { // driverId might not be needed if API is user-contextual
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/drivers/documents');
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('خطا در دریافت لیست مدارک.');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependency on driverId if API is user contextual

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">هنوز هیچ مدرکی بارگذاری نشده است.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدارک بارگذاری شده</CardTitle>
        <CardDescription>لیست مدارکی که تاکنون بارگذاری کرده‌اید.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {documents.map(doc => (
            <li key={doc.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-semibold">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                <p className="text-xs text-gray-500">نام فایل: {doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  تاریخ بارگذاری: {new Date(doc.uploaded_at).toLocaleDateString('fa-IR')}
                </p>
                {doc.review_notes && (
                    <p className="text-xs text-orange-600 mt-1">یادداشت بررسی: {doc.review_notes}</p>
                )}
              </div>
              <PlaceholderBadge // Replace with actual Badge component later
                variant={STATUS_LABELS_COLORS[doc.status]?.color || 'default'}
              >
                {STATUS_LABELS_COLORS[doc.status]?.label || doc.status}
              </PlaceholderBadge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DocumentsList;
