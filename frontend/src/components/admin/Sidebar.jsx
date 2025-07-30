'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Car, Map, LogOut, DollarSign, BarChart2, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { href: '/admin/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: Users },
  { href: '/admin/drivers', label: 'مدیریت رانندگان', icon: Car },
  { href: '/admin/trips', label: 'مدیریت سفرها', icon: Map },
  { href: '/admin/transactions', label: 'تراکنش‌ها', icon: DollarSign },
  { type: 'divider', label: 'محتوا و گزارش' },
  { href: '/admin/articles', label: 'مدیریت مقالات', icon: FileText },
  { href: '/admin/reports/bookings', label: 'گزارش رزروها', icon: BarChart2 },
  { href: '/admin/reports/financial', label: 'گزارش مالی', icon: BarChart2 },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-secondary text-white flex flex-col shadow-lg">
      <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700/50">
        <Link href="/admin/dashboard">پنل مدیریت</Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={`divider-${index}`} className="pt-4 pb-2">
                <span className="px-4 text-xs font-semibold uppercase text-gray-400">{item.label}</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                pathname.startsWith(item.href)
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 ml-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700/50">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/80 hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 ml-4" />
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
