'use client';

import React from 'react';
import Button from '../ui/Button';

const DataTable = ({
  columns,
  data,
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (!data) {
    return <p className="text-center text-gray-500 py-8">در حال بارگذاری داده‌ها...</p>;
  }
  if (data.length === 0) {
    return <p className="text-center text-gray-500 py-8">داده‌ای برای نمایش وجود ندارد.</p>;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200/80 shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  {col.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={`${col.accessor}-${rowIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-brand-secondary"
                  >
                    {col.Cell ? col.Cell({ row }) : (row[col.accessor] === null || row[col.accessor] === undefined ? '-' : row[col.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            صفحه {currentPage} از {totalPages}
          </span>
          <div className="space-x-2 rtl:space-x-reverse">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
            >
              قبلی
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
