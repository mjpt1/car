'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminListArticles, deleteArticle } from '../../../lib/services/articleService';
import DataTable from '../../../components/admin/DataTable';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import { toast } from 'react-toastify';

export default function AdminArticlesPage() {
  const router = useRouter();
  const [data, setData] = useState({ data: [], totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchArticles = useCallback(async (currentPage) => {
    setIsLoading(true);
    try {
      const result = await adminListArticles({ page: currentPage, limit: 10 });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch articles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
        try {
            await deleteArticle(articleId);
            toast.success('Article deleted successfully.');
            fetchArticles(page); // Refresh list
        } catch (err) {
            toast.error(err.message || 'Failed to delete article.');
        }
    }
  }

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'عنوان', accessor: 'title' },
    { Header: 'وضعیت', accessor: 'status', Cell: ({ row }) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.status}</span> },
    { Header: 'نویسنده', accessor: 'author_first_name', Cell: ({ row }) => row.author_first_name || 'N/A' },
    { Header: 'تاریخ انتشار', accessor: 'published_at', Cell: ({ row }) => row.published_at ? new Date(row.published_at).toLocaleDateString('fa-IR') : '-' },
    { Header: 'عملیات', accessor: 'actions', Cell: ({ row }) => (
      <div className="space-x-2 rtl:space-x-reverse">
        <Button size="sm" variant="outline" onClick={() => router.push(`/admin/articles/edit/${row.id}`)}>ویرایش</Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>حذف</Button>
      </div>
    )},
  ], [router, page, fetchArticles]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت مقالات</h1>
        </div>
        <Button onClick={() => router.push('/admin/articles/new')}>
          ایجاد مقاله جدید
        </Button>
      </header>

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
