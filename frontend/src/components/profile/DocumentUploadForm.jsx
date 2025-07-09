'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../lib/apiClient';
import Button from '../ui/Button';
import Input from '../ui/Input'; // Standard input for file type
import Label from '../ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';

const documentSchema = z.object({
  document_type: z.string().min(1, "نوع مدرک الزامی است"),
  document_file: z.any().refine(files => files && files.length > 0, "فایل مدرک الزامی است.")
                   .refine(files => files && files?.[0]?.size <= 5 * 1024 * 1024, `حداکثر حجم فایل ۵ مگابایت است.`)
                   .refine(
                     files => files && files?.[0]?.type && ['image/jpeg', 'image/png', 'application/pdf'].includes(files[0].type),
                     "فرمت فایل معتبر نیست. (JPG, PNG, PDF)"
                   ),
});

const DOCUMENT_TYPES = [
  { value: 'license', label: 'گواهینامه رانندگی' },
  { value: 'vehicle_registration', label: 'کارت ماشین' },
  { value: 'insurance', label: 'بیمه‌نامه شخص ثالث' },
  { value: 'national_id', label: 'کارت ملی' },
  // Add other document types as needed
];

const DocumentUploadForm = ({ onUploadSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState(null);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(documentSchema),
  });

  const documentFile = watch('document_file');

  useEffect(() => {
    if (documentFile && documentFile.length > 0) {
      const file = documentFile[0];
      if (['image/jpeg', 'image/png'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null); // No preview for PDF or other types
      }
    } else {
      setPreview(null);
    }
  }, [documentFile]);


  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document', data.document_file[0]); // 'document' is the field name expected by backend (multer)

    try {
      await apiClient.post('/drivers/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ type: 'success', text: `مدرک (${DOCUMENT_TYPES.find(dt => dt.value === data.document_type)?.label}) با موفقیت بارگذاری شد.` });
      reset(); // Reset form fields
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess(); // Callback to refresh documents list
      }
    } catch (error) {
      console.error('Document upload failed:', error.response?.data?.message || error.message);
      setMessage({ type: 'error', text: error.response?.data?.message || 'خطا در بارگذاری مدرک.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>بارگذاری مدارک</CardTitle>
        <CardDescription>مدارک مورد نیاز را جهت تایید بارگذاری کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        {message.text && (
          <p className={`mb-4 text-sm text-center p-2 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="document_type">نوع مدرک</Label>
            <select
              id="document_type"
              {...register('document_type')}
              className={`mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm ${errors.document_type ? 'border-red-500' : ''}`}
            >
              <option value="">-- انتخاب نوع مدرک --</option>
              {DOCUMENT_TYPES.map(docType => (
                <option key={docType.value} value={docType.value}>{docType.label}</option>
              ))}
            </select>
            {errors.document_type && <p className="text-xs text-red-600 mt-1">{errors.document_type.message}</p>}
          </div>

          <div>
            <Label htmlFor="document_file">انتخاب فایل (JPG, PNG, PDF - حداکثر ۵ مگابایت)</Label>
            <Input
              id="document_file"
              type="file"
              {...register('document_file')}
              className={`mt-1 ${errors.document_file ? 'border-red-500' : ''}`}
              accept=".jpg,.jpeg,.png,.pdf"
            />
            {errors.document_file && <p className="text-xs text-red-600 mt-1">{errors.document_file.message}</p>}
          </div>

          {preview && (
            <div className="mt-2">
              <p className="text-sm font-medium">پیش‌نمایش:</p>
              <img src={preview} alt="Preview" className="max-h-48 w-auto rounded-md border border-gray-300" />
            </div>
          )}


          <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? <Spinner className="mr-2" size="sm"/> : null}
            بارگذاری مدرک
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;
