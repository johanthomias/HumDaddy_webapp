'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminPanel } from '@/components/admin/admin-panel';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/connexion');
    }
  }, [loading, user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Accès réservé</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-night px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <AdminPanel />
      </div>
    </main>
  );
}
