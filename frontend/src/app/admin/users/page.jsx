'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { listUsers } from '../../../lib/services/adminService';
import DataTable from '../../../components/admin/DataTable';
import Spinner from '../../../components/ui/Spinner';
import Input from '../../../components/ui/Input';
import useDebounce from '../../../hooks/useDebounce'; // A custom hook for debouncing input

// A simple debounce hook (can be in its own file: /hooks/useDebounce.js)
const useDebounce_local = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


export default function AdminUsersPage() {
  const [data, setData] = useState({ users: [], totalPages: 1, currentPage: 1, totalUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce_local(searchTerm, 500);

  const fetchUsers = useCallback(async (currentPage, search) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await listUsers({ page: currentPage, search, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm, fetchUsers]);


  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'نام', accessor: 'first_name', Cell: ({ row }) => row.first_name || '-' },
    { Header: 'نام خانوادگی', accessor: 'last_name', Cell: ({ row }) => row.last_name || '-' },
    { Header: 'ایمیل', accessor: 'email', Cell: ({ row }) => row.email || '-' },
    { Header: 'شماره موبایل', accessor: 'phone_number' },
    { Header: 'نقش', accessor: 'role' },
    { Header: 'تاریخ ثبت‌نام', accessor: 'created_at', Cell: ({ row }) => new Date(row.created_at).toLocaleDateString('fa-IR') },
  ], []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">مدیریت کاربران</h1>
        <p className="text-gray-600 mt-1">مشاهده و جستجوی کاربران سیستم.</p>
      </header>

      <div className="max-w-sm">
        <Input
          type="text"
          placeholder="جستجو بر اساس نام، ایمیل، موبایل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={data.users}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
