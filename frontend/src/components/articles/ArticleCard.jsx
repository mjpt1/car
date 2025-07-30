'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';

const ArticleCard = ({ article }) => {
  if (!article) return null;

  const authorName = `${article.author_first_name || 'نویسنده'}`.trim();

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/blog/${article.slug}`} passHref>
          <div className="relative w-full h-48">
            <Image
              src={article.cover_image_url || '/placeholder-image.jpg'} // Provide a placeholder
              alt={article.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl font-bold mb-2">
          <Link href={`/blog/${article.slug}`} className="hover:text-brand-primary transition-colors">
            {article.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">
          {article.excerpt}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center text-xs text-gray-500">
        <span>توسط {authorName}</span>
        <span>{new Date(article.published_at).toLocaleDateString('fa-IR')}</span>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
