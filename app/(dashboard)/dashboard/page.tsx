'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OnboardingStepper } from '@/components/dashboard/onboarding-stepper';
import { GiftManager } from '@/components/dashboard/gift-manager';
import { WalletWidget } from '@/components/dashboard/wallet-widget';
import { CashoutWidget } from '@/components/dashboard/cashout-widget';
import { useAuth } from '@/components/providers/auth-provider';
import { ShareModal } from '@/components/dashboard/share-modal';
import { Share2, LogOut } from 'lucide-react';
import { AccountAlert } from '@/components/dashboard/account-alert';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

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

  const isBanned = user.isBanned;
  const isRestricted = user.stripeOnboardingStatus === 'restricted' || user.stripeOnboardingStatus === 'disabled';

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
          <div className="flex items-center gap-3">
            <Link href={`/${user.username || ''}`} className="px-6 py-3 rounded-full border border-white/20">
              Ma vitrine <span className="text-pink">/{user.username || 'username'}</span>
            </Link>
            {user.username && (
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold"
              >
                Partager
                <Share2 size={16} />
              </button>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white/70 hover:border-white/40"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </header>

        {isBanned && <AccountAlert variant="ban" banReason={(user as any).banReason} />}
        {!isBanned && isRestricted && <AccountAlert variant="restricted" />}

        <div className="grid gap-6">
          <OnboardingStepper />
          <GiftManager />
          <div className="grid gap-6 md:grid-cols-2">
            <WalletWidget />
            <CashoutWidget />
          </div>
        </div>
      </div>
      {user.username && (
        <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} username={user.username} />
      )}
    </main>
  );
}
