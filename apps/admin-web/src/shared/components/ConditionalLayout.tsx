'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from './layout/DashboardLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
   if (authPages.includes(pathname)) {
    return <div className="w-screen h-screen flex items-center justify-center">{children}</div>;
  }
  
   return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
