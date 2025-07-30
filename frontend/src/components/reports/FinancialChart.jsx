'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const FinancialChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-8">داده‌ای برای نمایش نمودار وجود ندارد.</p>;
  }

  const formattedData = data.map(item => ({
      ...item,
      total_revenue: parseFloat(item.total_revenue),
      report_date: new Date(item.report_date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
  }));

  const formatYAxis = (tickItem) => {
    // Format to K for thousands, M for millions
    if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}K`;
    return tickItem;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <LineChart
                data={formattedData}
                margin={{
                top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="report_date" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip
                    formatter={(value) => `${value.toLocaleString('fa-IR')} تومان`}
                    labelStyle={{ direction: 'rtl' }}
                    contentStyle={{ direction: 'rtl', borderRadius: '0.5rem' }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="total_revenue"
                    name="درآمد کل (تومان)"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
