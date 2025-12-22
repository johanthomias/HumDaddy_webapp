'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingStepper } from '@/components/dashboard/onboarding-stepper';
import { GiftManager } from '@/components/dashboard/gift-manager';
import { WalletWidget } from '@/components/dashboard/wallet-widget';
import { CashoutWidget } from '@/components/dashboard/cashout-widget';
import { useAuth } from '@/components/providers/auth-provider';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/connexion');
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Redirection...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-night to-obsidian px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/50 text-sm uppercase tracking-[0.4em]">dashboard</p>
            <h1 className="text-4xl font-semibold">
              Bonjour {user.publicName || user.username || user.phoneNumber}
            </h1>
            <p className="text-xs text-white/30 py-2"> Votre espace privé. Vos règles !</p>
          </div>
          <Link href={`/${user.username || ''}`} className="px-6 py-3 rounded-full border border-white/20">
            Ma vitrine <span className="text-pink">/{user.username || 'username'}</span>
          </Link>
        </header>

        <div className="grid gap-6">
          <OnboardingStepper />
          <GiftManager />
          <div className="grid gap-6 md:grid-cols-2">
            <WalletWidget />
            <CashoutWidget />
          </div>
        </div>
      </div>
    </main>
  );
}
