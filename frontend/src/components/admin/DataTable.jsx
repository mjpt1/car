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
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-8">داده‌ای برای نمایش وجود ندارد.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={`${col.accessor}-${rowIndex}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                >
                  {col.Cell ? col.Cell({ row }) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t">
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
