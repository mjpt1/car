'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ArticleForm from '../../../../../components/admin/ArticleForm';
import { getArticleById, updateArticle } from '../../../../../lib/services/articleService';
import { toast } from 'react-toastify';
import Spinner from '../../../../../components/ui/Spinner';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id;

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      const data = await getArticleById(articleId);
      setArticle(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch article details.");
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      data.categoryIds = data.categoryIds?.map(Number);
      data.tagIds = data.tagIds?.map(Number);

      await updateArticle(articleId, data);
      toast.success('Article updated successfully!');
      router.push('/admin/articles');
    } catch (error) {
      toast.error(error.message || 'Failed to update article.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  if (!article) {
      return <p className="text-center text-red-500">مقاله مورد نظر یافت نشد.</p>
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">ویرایش مقاله: {article.title}</h1>
      </header>
      <ArticleForm article={article} onSave={handleSave} isLoading={isSaving} />
    </div>
  );
}
