'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const StatCard = ({ title, value, icon: Icon, description }) => {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-brand-secondary-light">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-brand-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-brand-secondary">{value}</div>
        {description && <p className="text-xs text-brand-secondary-light mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
