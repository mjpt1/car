'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { listAllTransactions } from '../../../lib/services/transactionService';
import DataTable from '../../../components/admin/DataTable';
import Spinner from '../../../components/ui/Spinner';

export default function AdminTransactionsPage() {
  const [data, setData] = useState({ transactions: [], totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  // Add filters for status, userId, etc. later if needed

  const fetchTransactions = useCallback(async (currentPage) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listAllTransactions({ page: currentPage, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'کاربر', accessor: 'user_email' },
    { Header: 'مبلغ (تومان)', accessor: 'amount', Cell: ({ row }) => parseFloat(row.amount).toLocaleString('fa-IR') },
    { Header: 'نوع', accessor: 'type' },
    { Header: 'وضعیت', accessor: 'status', Cell: ({ row }) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        row.status === 'completed' ? 'bg-green-100 text-green-700' :
        row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
    }`}>{row.status}</span> },
    { Header: 'درگاه', accessor: 'gateway' },
    { Header: 'شناسه درگاه', accessor: 'gateway_transaction_id', Cell: ({ row }) => row.gateway_transaction_id || '-' },
    { Header: 'تاریخ', accessor: 'created_at', Cell: ({ row }) => new Date(row.created_at).toLocaleString('fa-IR') },
  ], []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">مدیریت تراکنش‌ها</h1>
        <p className="text-gray-600 mt-1">مشاهده تمام تراکنش‌های مالی سیستم.</p>
      </header>

      {/* Add filter inputs here later */}

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data.transactions}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
