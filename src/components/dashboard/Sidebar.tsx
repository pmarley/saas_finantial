'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transações', href: '/dashboard/transactions', icon: CreditCardIcon },
  { name: 'Categorias', href: '/dashboard/categories', icon: TagIcon },
  { name: 'Relatórios', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Configurações', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar({ isOpen = true }: { isOpen?: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    console.log('Sidebar isOpen state changed:', isOpen);
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      } lg:relative lg:z-0 h-full`}
    >
      <div className="flex h-full flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className={`flex flex-shrink-0 items-center px-4 ${isOpen ? '' : 'justify-center'}`}>
            {isOpen ? (
              <h1 className="text-xl font-bold text-gray-900">SaaS Financeiro</h1>
            ) : (
              <span className="text-xl font-bold text-gray-900">SF</span>
            )}
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${isOpen ? '' : 'justify-center'}`}
                  title={isOpen ? undefined : item.name}
                >
                  <item.icon
                    className={`h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 