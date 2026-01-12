'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthApi } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await AdminAuthApi.login({ email, password });
      loginAdmin(data.accessToken, data.user);
      router.push('/admin');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Connexion impossible';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-night flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md glass-panel p-8 space-y-6 border border-white/10"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Accès admin</p>
          <h1 className="text-2xl font-semibold text-white">Connexion admin</h1>
          <p className="text-sm text-white/50">
            Espace réservé. Connectez-vous avec vos identifiants administrateur.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/60">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white text-night font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Connexion admin'}
        </button>
      </form>
    </main>
  );
}
