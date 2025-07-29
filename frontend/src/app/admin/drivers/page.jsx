'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { listDrivers } from '../../../lib/services/adminService';
import DataTable from '../../../components/admin/DataTable';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';

const DRIVER_STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'pending_approval', label: 'در انتظار تایید' },
  { value: 'approved', label: 'تایید شده' },
  { value: 'rejected', label: 'رد شده' },
];

export default function AdminDriversPage() {
  const router = useRouter();
  const [data, setData] = useState({ drivers: [], totalPages: 1, currentPage: 1, totalDrivers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDrivers = useCallback(async (currentPage, status) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listDrivers({ page: currentPage, status, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers(page, statusFilter);
  }, [page, statusFilter, fetchDrivers]);

  const columns = useMemo(() => [
    { Header: 'ID راننده', accessor: 'driver_id' },
    { Header: 'نام', accessor: 'first_name', Cell: ({ row }) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-' },
    { Header: 'شماره موبایل', accessor: 'phone_number' },
    { Header: 'وضعیت', accessor: 'status', Cell: ({ row }) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        row.status === 'approved' ? 'bg-green-100 text-green-700' :
        row.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
    }`}>{row.status}</span> },
    { Header: 'تاریخ درخواست', accessor: 'created_at', Cell: ({ row }) => new Date(row.created_at).toLocaleDateString('fa-IR') },
    { Header: 'عملیات', accessor: 'actions', Cell: ({ row }) => (
      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/drivers/${row.driver_id}`)}>
        مشاهده جزئیات
      </Button>
    )},
  ], [router]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">مدیریت رانندگان</h1>
        <p className="text-gray-600 mt-1">بررسی و تایید رانندگان جدید.</p>
      </header>

      <div className="max-w-xs">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">فیلتر بر اساس وضعیت:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1); // Reset to first page on filter change
          }}
          className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
        >
          {DRIVER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data.drivers}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
