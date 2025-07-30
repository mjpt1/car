import { getArticleBySlug } from '../../../lib/services/articleService';
import parse from 'html-react-parser';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    const article = await getArticleBySlug(params.slug);
    if (!article) {
      return {
        title: 'Article Not Found',
      };
    }
    return {
      title: article.title,
      description: article.excerpt,
      // You can add more metadata here like openGraph, keywords etc.
      keywords: article.tags?.map(tag => tag.name).join(', '),
    };
  } catch (error) {
    return {
      title: 'Error',
      description: 'Could not fetch article details.',
    };
  }
}

// This is a Server Component
export default async function ArticlePage({ params }) {
  let article;
  try {
    article = await getArticleBySlug(params.slug);
  } catch (error) {
    console.error(`Failed to fetch article with slug ${params.slug}:`, error);
    // If article not found, the service throws an error.
    notFound();
  }

  const authorName = `${article.author_first_name || ''} ${article.author_last_name || 'نویسنده'}`.trim();

  // Basic JSON-LD schema for an article
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/blog/${article.slug}`,
    },
    headline: article.title,
    image: article.cover_image_url || '',
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your App Name', // Replace with your app/company name
      // logo: {
      //   '@type': 'ImageObject',
      //   url: 'your-logo-url.png',
      // },
    },
    description: article.excerpt,
  };

  return (
    <>
      {/* Inject JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{article.title}</h1>
          <div className="text-sm text-gray-500">
            <span>توسط {authorName}</span>
            <span className="mx-2">•</span>
            <span>منتشر شده در {new Date(article.published_at).toLocaleDateString('fa-IR')}</span>
          </div>
          {article.categories && article.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                  {article.categories.map(cat => (
                      <span key={cat.id} className="text-xs font-semibold bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">{cat.name}</span>
                  ))}
              </div>
          )}
        </header>

        {article.cover_image_url && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {article.content ? parse(article.content) : ''}
        </div>

         {article.tags && article.tags.length > 0 && (
              <footer className="mt-12 pt-6 border-t">
                <h3 className="font-semibold mb-3">تگ‌ها:</h3>
                <div className="flex flex-wrap gap-2">
                    {article.tags.map(tag => (
                        <span key={tag.id} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{tag.name}</span>
                    ))}
                </div>
              </footer>
          )}
      </article>
    </>
  );
}
