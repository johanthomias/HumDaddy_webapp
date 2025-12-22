'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { UserApi } from '@/lib/api';

export default function InscriptionPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const phoneFromQuery = searchParams.get('phone') || user?.phoneNumber || '';

  const [form, setForm] = useState({
    username: user?.username || '',
    publicName: user?.publicName || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/connexion');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        publicName: user.publicName || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setSaving(true);
    setMessage('');
    try {
      await UserApi.update(form);
      await refreshProfile();
      router.push('/dashboard');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Impossible de sauvegarder le profil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-night text-white">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-b from-night to-obsidian">
      <div className="w-full max-w-xl glass-panel p-10 space-y-6">
        <p className="text-white/50 uppercase tracking-[0.4em] text-xs">inscription</p>
        <h1 className="text-3xl font-semibold">Complète ton profil</h1>
        <p className="text-white/60 text-sm">
          Ton numéro est vérifié. Choisis ton pseudo public et personnalise ta vitrine premium.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/50">Numéro vérifié</label>
            <input
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white mt-1"
              value={phoneFromQuery}
              disabled
            />
          </div>
          <div>
            <label className="text-sm text-white/50">Pseudo public</label>
            <input
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white mt-1"
              placeholder="ex: luna-deluxe"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-white/50">Nom affiché</label>
            <input
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white mt-1"
              placeholder="Nom public"
              value={form.publicName}
              onChange={(e) => setForm((prev) => ({ ...prev, publicName: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-white/50">Bio</label>
            <textarea
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white mt-1"
              rows={4}
              placeholder="Présente-toi en quelques lignes"
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !form.username}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          Valider mon inscription
        </button>

        {message && <p className="text-sm text-red-400 text-center">{message}</p>}

        <div className="text-center text-white/50 text-sm">
          <Link href="/dashboard" className="underline">
            Déjà configuré ? Accéder au dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
