'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleForm from '../../../../components/admin/ArticleForm';
import { createArticle } from '../../../../lib/services/articleService';
import { toast } from 'react-toastify';

export default function NewArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      // Convert checked IDs from string to number if needed
      data.categoryIds = data.categoryIds?.map(Number);
      data.tagIds = data.tagIds?.map(Number);

      await createArticle(data);
      toast.success('Article created successfully!');
      router.push('/admin/articles');
    } catch (error) {
      toast.error(error.message || 'Failed to create article.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">ایجاد مقاله جدید</h1>
      </header>
      <ArticleForm onSave={handleSave} isLoading={isLoading} />
    </div>
  );
}
