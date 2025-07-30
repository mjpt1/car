'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBookingsReport, downloadBookingsCsv } from '../../../../lib/services/reportService';
import DataTable from '../../../../components/admin/DataTable';
import Spinner from '../../../../components/ui/Spinner';
import ReportFilters from '../../../../components/reports/ReportFilters'; // A more generic filter component
import Button from '../../../../components/ui/Button';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BookingsReportPage() {
  const [data, setData] = useState({ data: [], totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async (currentPage, currentFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getBookingsReport({ page: currentPage, ...currentFilters, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(page, filters);
  }, [page, filters, fetchReport]);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        await downloadBookingsCsv(filters);
        toast.success("دانلود گزارش آغاز شد.");
    } catch (err) {
        toast.error(err.message || "خطا در دانلود گزارش.");
    } finally {
        setIsDownloading(false);
    }
  };

  const columns = useMemo(() => [
    { Header: 'ID رزرو', accessor: 'id' },
    { Header: 'وضعیت', accessor: 'status' },
    { Header: 'مبلغ', accessor: 'total_amount', Cell: ({ row }) => parseFloat(row.total_amount).toLocaleString('fa-IR') },
    { Header: 'کاربر', accessor: 'user_name', Cell: ({ row }) => `${row.user_first_name || ''} ${row.user_last_name || ''}`.trim() },
    { Header: 'راننده', accessor: 'driver_name', Cell: ({ row }) => row.driver_first_name },
    { Header: 'مبدا', accessor: 'origin_location' },
    { Header: 'مقصد', accessor: 'destination_location' },
    { Header: 'تاریخ رزرو', accessor: 'booking_time', Cell: ({ row }) => new Date(row.booking_time).toLocaleString('fa-IR') },
  ], []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">گزارش رزروها</h1>
            <p className="text-gray-600 mt-1">مشاهده و استخراج گزارش کامل رزروهای سیستم.</p>
        </div>
        <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Spinner size="sm" className="ml-2" /> : <Download size={16} className="ml-2" />}
            دانلود CSV
        </Button>
      </header>

      <ReportFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data.data}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
