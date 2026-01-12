'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { AdminPanel } from '@/components/admin/admin-panel';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/admin/login');
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
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-end">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white/70 hover:border-white/40"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
        <AdminPanel />
      </div>
    </main>
  );
}
