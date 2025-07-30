'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialReport } from '../../../../lib/services/reportService';
import ReportFilters from '../../../../components/reports/ReportFilters';
import FinancialChart from '../../../../components/reports/FinancialChart';
import Spinner from '../../../../components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

export default function FinancialReportPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  const fetchReport = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getFinancialReport(currentFilters);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch financial report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch without filters
    fetchReport({});
  }, [fetchReport]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchReport(newFilters);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">گزارش مالی</h1>
        <p className="text-gray-600 mt-1">نمودار درآمد روزانه سیستم.</p>
      </header>

      <ReportFilters onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader>
          <CardTitle>نمودار درآمد روزانه</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <FinancialChart data={data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
