'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Car, Map, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { href: '/admin/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: Users },
  { href: '/admin/drivers', label: 'مدیریت رانندگان', icon: Car },
  { href: '/admin/trips', label: 'مدیریت سفرها', icon: Map },
  // Add more items as needed
  // { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        <Link href="/admin/dashboard">پنل ادمین</Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
              pathname === item.href
                ? 'bg-brand-primary text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 ml-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 ml-3" />
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
