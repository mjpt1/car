'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Spinner from '../ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const searchSchema = z.object({
  origin: z.string().min(1, "مبدا الزامی است"),
  destination: z.string().min(1, "مقصد الزامی است"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ باید با فرمت YYYY-MM-DD باشد")
    .refine(dateStr => !isNaN(new Date(dateStr).getTime()), "تاریخ نامعتبر است")
    .refine(dateStr => new Date(dateStr) >= new Date(new Date().toISOString().split('T')[0]), "تاریخ نمی‌تواند در گذشته باشد"),
});

const SearchForm = ({ onSearch, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });

  const handleFormSubmit = (data) => {
    onSearch(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-brand-primary">جستجوی سفر</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">مبدا</Label>
              <Input
                id="origin"
                placeholder="مثال: تهران"
                {...register('origin')}
                className={errors.origin ? 'border-red-500' : ''}
              />
              {errors.origin && <p className="text-xs text-red-600 mt-1">{errors.origin.message}</p>}
            </div>
            <div>
              <Label htmlFor="destination">مقصد</Label>
              <Input
                id="destination"
                placeholder="مثال: اصفهان"
                {...register('destination')}
                className={errors.destination ? 'border-red-500' : ''}
              />
              {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="date">تاریخ حرکت</Label>
            <Input
              id="date"
              type="date"
              dir="ltr"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
          </div>
          <Button type="submit" className="w-full text-lg" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
            جستجو
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
