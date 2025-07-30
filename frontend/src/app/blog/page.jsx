'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { listArticles } from '../../lib/services/articleService';
import ArticleCard from '../../components/articles/ArticleCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = useCallback(async (currentPage) => {
    setIsLoading(true);
    try {
      const result = await listArticles({ page: currentPage, limit: 9 }); // 9 for a 3-col grid
      setArticles(prev => currentPage === 1 ? result.data : [...prev, ...result.data]);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message || 'Failed to fetch articles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-20">{error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">وبلاگ</h1>
        <p className="text-lg text-gray-600 mt-2">آخرین مقالات و اخبار ما را دنبال کنید.</p>
      </header>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500">هیچ مقاله‌ای برای نمایش وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {page < totalPages && (
        <div className="text-center mt-12">
          <Button onClick={handleLoadMore} disabled={isLoading} size="lg">
            {isLoading ? <Spinner size="sm" /> : 'نمایش بیشتر'}
          </Button>
        </div>
      )}
    </div>
  );
}
