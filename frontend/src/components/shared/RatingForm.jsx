'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { Star } from 'lucide-react';
import { createRating } from '../../lib/services/ratingService';

const ratingSchema = z.object({
  rating: z.number().min(1, "امتیاز الزامی است"),
  comment: z.string().max(1000, "نظر شما نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد").optional(),
});

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex justify-center space-x-1 rtl:space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <Star
              className="cursor-pointer transition-colors"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              fill={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
};


const RatingForm = ({ isOpen, onClose, tripId, onRatingSuccess }) => {
  const [rating, setRating] = useState(0);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ratingSchema),
  });

  // Update react-hook-form's value when star rating changes
  useEffect(() => {
    if (rating > 0) {
      setValue('rating', rating, { shouldValidate: true });
    }
  }, [rating, setValue]);


  const onSubmit = async (data) => {
    setIsLoading(true);
    setFormMessage({ type: '', text: '' });
    try {
      const payload = { ...data, trip_id: tripId };
      await createRating(payload);
      setFormMessage({ type: 'success', text: 'امتیاز شما با موفقیت ثبت شد.' });
      setTimeout(() => {
        onRatingSuccess(); // Callback to parent to close modal and refresh data
      }, 1500);
    } catch (error) {
      setFormMessage({ type: 'error', text: error.message || 'خطا در ثبت امتیاز.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">امتیاز و بازخورد شما</h3>
        <p className="text-sm text-center text-gray-600 mb-6">
          لطفاً به سفر خود با شناسه {tripId} امتیاز دهید.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <StarRating rating={rating} setRating={setRating} />
            {errors.rating && <p className="text-xs text-red-600 mt-2 text-center">{errors.rating.message}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              نظر شما (اختیاری)
            </label>
            <textarea
              id="comment"
              rows={4}
              {...register('comment')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm ${errors.comment ? 'border-red-500' : ''}`}
              placeholder="تجربه خود از این سفر را بنویسید..."
            />
            {errors.comment && <p className="text-xs text-red-600 mt-1">{errors.comment.message}</p>}
          </div>

          {formMessage.text && (
            <p className={`text-sm text-center ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {formMessage.text}
            </p>
          )}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              انصراف
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? <Spinner size="sm" /> : 'ثبت امتیاز'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingForm;
