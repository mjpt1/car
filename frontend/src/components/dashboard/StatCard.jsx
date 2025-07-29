'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const StatCard = ({ title, value, icon: Icon, description }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-brand-primary">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
