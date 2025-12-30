'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthApi } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export default function ConnexionPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const requestOtp = async () => {
    try {
      setLoading(true);
      await AuthApi.requestOtp(phoneNumber);
      setMessage('OTP envoyé, vérifiez vos SMS');
      setStep('otp');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Impossible d'envoyer l'OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const { data } = await AuthApi.verifyOtp({ phoneNumber, code });
      login(data.accessToken, data.user);
      if (data.isNewUser) {
        setMessage('Bienvenue ! Personnalisez votre profil.');
        router.push(`/inscription?phone=${encodeURIComponent(phoneNumber)}`);
      } else {
        setMessage('Connexion réussie');
       // router.push('/dashboard');
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-b from-night to-obsidian">
      <div className="w-full max-w-lg glass-panel p-10 space-y-8">
        <div>
          <p className="text-white/50 uppercase tracking-[0.4em] text-xs">Se Connecter</p>
          <h1 className="text-3xl font-semibold text-pink">HumDaddy</h1>
          <p className="text-white/60 text-sm mt-2">Entrez votre numéro de téléphone mobile et nous vous enverrons un SMS pour le confirmer</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <label className="block text-sm text-white/60">Numéro de téléphone</label>
            <input
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none"
              placeholder="06 00 00 00 00"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button
              onClick={requestOtp}
              disabled={!phoneNumber || loading}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Recevoir mon code
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <label className="block text-sm text-white/60">Code reçu</label>
            <input
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 tracking-[0.5em] text-center"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••"
            />
            <button
              onClick={verifyOtp}
              disabled={code.length < 6 || loading}
              className="w-full bg-accent-pink text-night py-3 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Valider & ouvrir mon dashboard
            </button>
            <button
              onClick={() => setStep('phone')}
              className="text-white/50 text-sm underline"
            >
              Modifier mon numéro
            </button>
          </div>
        )}

        {message && <p className="text-center text-white/70 text-sm">{message}</p>}

        <div className="text-xs text-white/40 flex flex-col gap-2">
        <p className="text-white/40">En vous connectant, vous acceptez nos <a className="hover:text-pink underline font-semibold" href="#">Conditions d'utilisation</a>, notre <a className=" hover:text-pink underline font-semibold" href="#">Clause d'arbitrage</a> et notre <a className=" hover:text-pink underline font-semibold" href="#">Politique de confidentialité</a>, et vous confirmez que vous êtes âgé d'au moins 18 ans.</p>
          <Link href="/" className="hover:text-pink underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
