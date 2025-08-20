'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated, setLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current page is a public admin page (login, register, etc.)
  const isPublicAdminPage = pathname?.includes('/login') || pathname?.includes('/register') || pathname?.includes('/forgot-password') || pathname?.includes('/reset-password');

  // Initialize auth state
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicAdminPage) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router, isPublicAdminPage]);

  useEffect(() => {
    if (!loading && user && !['admin', 'super_admin'].includes(user.role) && !isPublicAdminPage) {
      router.push('/');
    }
  }, [loading, user, router, isPublicAdminPage]);

  // For public admin pages, render without authentication checks
  if (isPublicAdminPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
