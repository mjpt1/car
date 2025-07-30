'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // For App Router
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';
import SearchForm from '../components/search/SearchForm';
import TripCard from '../components/trips/TripCard';
import { searchTrips } from '../lib/services/tripService';
import Button from '../components/ui/Button'; // For potential login/register buttons

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // To read query params for initial search

  const [trips, setTrips] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // To only show "no results" after a search

  // Function to perform search and update URL
  const performSearch = async (searchData) => {
    setIsLoadingSearch(true);
    setSearchError('');
    setHasSearched(true);
    try {
      // Update URL query parameters
      const params = new URLSearchParams();
      params.set('origin', searchData.origin);
      params.set('destination', searchData.destination);
      params.set('date', searchData.date);
      // params.set('passengers', searchData.passengers.toString()); // If passengers are included
      router.push(`/?${params.toString()}`, { scroll: false }); // Update URL without full page reload for client-side search trigger

      const results = await searchTrips(searchData);
      if (Array.isArray(results)) {
        setTrips(results);
      } else if (results && results.trips) { // Handle backend returning { message, trips }
        setTrips(results.trips);
        if (results.trips.length === 0 && results.message) {
            setSearchError(results.message); // Show "no trips found" message from backend
        }
      } else {
        setTrips([]);
        setSearchError('فرمت پاسخ جستجو نامعتبر است.');
      }
    } catch (error) {
      console.error("Search failed:", error);
      setTrips([]);
      setSearchError(error.message || 'خطا در جستجوی سفرها. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Effect to perform search if query parameters are present on page load
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    // const passengers = searchParams.get('passengers');

    if (origin && destination && date) {
      performSearch({
        origin,
        destination,
        date,
        // passengers: passengers ? parseInt(passengers) : 1,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Rerun when searchParams change (e.g. from router.push)


  if (authLoading) { // Still show main app loading if auth state is not resolved
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-secondary">سفر خود را پیدا کنید</h1>
        <p className="text-lg text-brand-secondary-light mt-3 max-w-2xl mx-auto">ساده‌ترین راه برای رزرو آنلاین بلیط اتوبوس و سفر در سراسر ایران</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <SearchForm onSearch={performSearch} isLoading={isLoadingSearch} />
      </div>

      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-brand-primary-light border border-brand-primary/20 rounded-xl text-center">
          <p className="text-brand-primary-dark">
            برای دسترسی به تمامی امکانات و رزرو سفر، لطفاً{' '}
            <Link href="/login" className="font-bold hover:underline">وارد شوید</Link> یا{' '}
            <Link href="/register" className="font-bold hover:underline">ثبت‌نام کنید</Link>.
          </p>
        </div>
      )}

      {isLoadingSearch && (
        <div className="mt-8 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {searchError && !isLoadingSearch && (
        <div className="mt-8 text-center text-red-600 bg-red-50 p-4 rounded-md">
          <p>{searchError}</p>
        </div>
      )}

      {!isLoadingSearch && hasSearched && trips.length === 0 && !searchError && (
        <div className="mt-8 text-center text-gray-500 bg-gray-50 p-4 rounded-md">
          <p>هیچ سفری با مشخصات مورد نظر شما یافت نشد.</p>
        </div>
      )}

      {trips.length > 0 && !isLoadingSearch && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-brand-secondary">نتایج جستجو:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
       {/* Placeholder for when no search has been performed yet and no initial params */}
       {!hasSearched && !isLoadingSearch && trips.length === 0 && !searchError && (
        <div className="mt-12 text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl">برای یافتن سفر، لطفاً مبدا، مقصد و تاریخ را مشخص کنید.</p>
        </div>
      )}
    </div>
  );
}
