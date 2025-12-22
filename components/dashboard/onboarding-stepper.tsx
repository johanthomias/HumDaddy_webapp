'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle, Info } from 'lucide-react';
import { UserApi } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { MediaUploader } from '@/components/media/media-uploader';

const STEPS = [
  { key: 'username', label: 'Identité publique' },
  { key: 'profil', label: 'Photo & Bio' },
  { key: 'social', label: 'Réseaux' },
  { key: 'stripe', label: 'Compte' },
];

export const OnboardingStepper = () => {
  const { user, refreshProfile, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const isStripeActive = user?.stripeOnboardingStatus === 'actif';
  const stripeLabel = isStripeActive ? 'Compte actif' : 'Incomplet';

  const [form, setForm] = useState({
    username: user?.username || '',
    publicName: user?.publicName || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    contentType: user?.contentType || 'Créatrice premium',
    is18Plus: user?.is18Plus || false,
    onlyfans: user?.socialLinks?.onlyfans || '',
    mym: user?.socialLinks?.mym || '',
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
    twitch: user?.socialLinks?.twitch || '',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      username: user?.username || prev.username,
      publicName: user?.publicName || prev.publicName,
    }));
  }, [user?.username, user?.publicName]);

  const stepStatuses = useMemo(() => {
    return {
      username: Boolean(user?.username),
      profil: Boolean(user?.publicName && user?.avatarUrl),
      social: Boolean(user?.socialLinks && user?.is18Plus),
      stripe: Boolean(user?.stripeConnectAccountId),
    };
  }, [user]);

  const saveStep = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (currentStep === 0) {
        payload.username = form.username;
        payload.publicName = form.publicName;
      }
      if (currentStep === 1) {
        payload.bio = form.bio;
        payload.contentType = form.contentType;
      }
      if (currentStep === 2) {
        payload.is18Plus = form.is18Plus;
        payload.socialLinks = {
          onlyfans: form.onlyfans,
          mym: form.mym,
          instagram: form.instagram,
          twitter: form.twitter,
          twitch: form.twitch,
        };
      }
      if (Object.keys(payload).length > 0) {
        await UserApi.update(payload);
        await refreshProfile();
      }
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error('onboarding', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Tableau de bord</h2>
        <div className="flex items-center gap-2 text-sm">
          {isStripeActive ? (
            <span className="text-pink uppercase">Compte connecté</span>
          ) : (
            <span className="text-lg uppercase font-bold text-pink">Non connecté</span>
          )}
          <span className="relative inline-flex group">
            <Info size={16} className="text-white/50 cursor-pointer" />
            <span
              className="pointer-events-none absolute right-0 top-6 z-20 hidden w-80 rounded-xl border border-white/10 bg-black/90 px-3 py-2 text-xs text-white/80 shadow-lg group-hover:block"
              role="tooltip"
            >
              Pour que votre profil soit actif et visible des daddy&apos;s, vous devez compléter votre
              compte dans l&apos;espace <span className="text-white font-semibold">Compte</span>.
            </span>
          </span>
        </div>

      </div>

      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => (
          <button
            key={step.key}
            onClick={() => setCurrentStep(index)}
            className={`rounded-2xl border px-3 py-2 text-xs ${index === currentStep ? 'border-accent-pink bg-white/5' : 'border-white/5'
              }`}
          >
            <div className="flex items-center gap-2 justify-center">
              {stepStatuses[step.key as keyof typeof stepStatuses] ? (
                <CheckCircle size={14} className="text-pink" />
              ) : (
                <span className="text-white/40">{index + 1}</span>
              )}
              {step.label}
            </div>
          </button>
        ))}
      </div>

      {currentStep === 0 && (
        <div className="grid gap-4">
          <input
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
            placeholder="username public"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
            placeholder="Nom public"
            value={form.publicName}
            onChange={(e) => setForm({ ...form, publicName: e.target.value })}
          />
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-6 md:grid-cols-2">
          <textarea
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 md:col-span-2"
            placeholder="Quelques lignes pour poser le cadre…"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <div className="md:col-span-2">
            <MediaUploader
              label="Photo de profil"
              description="Format carré recommandé, 5 Mo max."
              maxFiles={1}
              folder="profile"
              scope="avatar"
              existingUrls={form.avatarUrl ? [form.avatarUrl] : []}
              token={token}
              onChange={async (urls) => {
                const avatar = urls[0] || '';
                setForm((prev) => ({ ...prev, avatarUrl: avatar }));
                if (avatar) {
                  await UserApi.update({ avatarUrl: avatar });
                  await refreshProfile();
                }
              }}
            />
            {form.avatarUrl && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">aperçu</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.avatarUrl}
                  alt="Avatar"
                  className="h-32 w-32 rounded-2xl border border-white/10 object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="grid gap-4">
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.is18Plus}
              onChange={(e) => setForm({ ...form, is18Plus: e.target.checked })}
            />
            Contenu réservé aux majeurs (toggle 18+)
          </label>
          {['onlyfans', 'mym', 'instagram', 'twitter', 'twitch'].map((field) => (
            <input
              key={field}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
              placeholder={`Lien ${field}`}
              value={form[field as keyof typeof form] as string}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
        </div>
      )}

      {currentStep === 3 && (
        <div
          className={`rounded-2xl border border-dashed border-white/20 p-6 space-y-3 text-sm text-white/70 transition
    ${isStripeActive ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
  `}
        >
          <p>
            Connectez votre compte Stripe Express pour recevoir chaque paiement directement sur votre
            balance. Le lien est généré depuis l&apos;espace baby web / mobile.
          </p>

          <p>
            Statut actuel : <span className="text-pink font-semibold">{stripeLabel}</span>
          </p>

          <a
            className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold
      ${!isStripeActive
                ? 'bg-primary text-white'
                : 'bg-white/10 text-white/40'
              }
    `}
            href={isStripeActive ? '#' : undefined}
            aria-disabled={!isStripeActive}
            tabIndex={isStripeActive ? 0 : -1}
          >
            Ouvrir Stripe Connect
          </a>
        </div>

      )}

      <button
        onClick={saveStep}
        disabled={loading}
        className="w-full bg-accent-pink text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        Sauvegarder cette étape
      </button>
    </div>
  );
};
