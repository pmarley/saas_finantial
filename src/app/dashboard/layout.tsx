'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { Suspense } from 'react';
import Loading from './loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    console.log('Dashboard layout - isSidebarOpen state:', isSidebarOpen);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
    console.log('New sidebar state:', !isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'lg:pl-1' : 'lg:pl-1'}`}>
          <main className="py-10 h-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-1">
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 