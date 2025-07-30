'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Spinner from '../ui/Spinner';
import RichTextEditor from './RichTextEditor';
import { listCategories } from '../../lib/services/categoryService';
import { listTags } from '../../lib/services/tagService';
import { toast } from 'react-toastify';

const articleSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  content: z.string().optional(),
  excerpt: z.string().max(300, "خلاصه نباید بیش از ۳۰۰ کاراکتر باشد").optional(),
  status: z.enum(['draft', 'published']),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
});

const ArticleForm = ({ article, onSave, isLoading }) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, tgs] = await Promise.all([listCategories(), listTags()]);
        setCategories(cats);
        setTags(tgs);
      } catch (error) {
        toast.error("Failed to load categories or tags.");
      }
    };
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      content: article?.content || '',
      excerpt: article?.excerpt || '',
      status: article?.status || 'draft',
      categoryIds: article?.categories?.map(c => c.id) || [],
      tagIds: article?.tags?.map(t => t.id) || [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow space-y-4">
        <div>
          <Label htmlFor="title">عنوان مقاله</Label>
          <Input id="title" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label>محتوای مقاله</Label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => <RichTextEditor content={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow space-y-4">
          <h3 className="font-semibold">تنظیمات انتشار</h3>
          <div>
              <Label htmlFor="excerpt">خلاصه (برای متای توضیحات و کارت مقاله)</Label>
              <textarea id="excerpt" rows={3} {...register('excerpt')} className={`w-full mt-1 p-2 border rounded-md ${errors.excerpt ? 'border-red-500' : ''}`} />
              {errors.excerpt && <p className="text-xs text-red-600 mt-1">{errors.excerpt.message}</p>}
          </div>
          <div>
              <Label>وضعیت</Label>
              <select {...register('status')} className="w-full mt-1 h-10 border-gray-300 rounded-md">
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
              </select>
          </div>
          <div>
              <Label>دسته‌بندی‌ها</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 max-h-32 overflow-y-auto border p-2 rounded-md">
                  {categories.map(cat => (
                      <label key={cat.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <input type="checkbox" value={cat.id} {...register('categoryIds')} />
                          <span>{cat.name}</span>
                      </label>
                  ))}
              </div>
          </div>
           <div>
              <Label>تگ‌ها</Label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 max-h-32 overflow-y-auto border p-2 rounded-md">
                  {tags.map(tag => (
                      <label key={tag.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <input type="checkbox" value={tag.id} {...register('tagIds')} />
                          <span>{tag.name}</span>
                      </label>
                  ))}
              </div>
          </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'ذخیره مقاله'}
        </Button>
      </div>
    </form>
  );
};

export default ArticleForm;
