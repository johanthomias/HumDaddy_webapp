'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle, Info } from 'lucide-react';
import { UserApi } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { MediaUploader } from '@/components/media/media-uploader';
import { StripeApi } from '@/lib/api';
import { FaInstagram, FaTwitter, FaTwitch } from 'react-icons/fa';
import { SiOnlyfans } from 'react-icons/si';
import { TbHandLoveYou } from 'react-icons/tb';

const STEPS = [
  { key: 'username', label: 'Identité publique' },
  { key: 'profil', label: 'Photo & Bio' },
  { key: 'social', label: 'Réseaux' },
  { key: 'stripe', label: 'Compte' },
];

const SOCIALS = [
  {
    key: 'onlyfans',
    label: 'OnlyFans',
    icon: <SiOnlyfans className="text-white/70" size={18} />,
  },
  {
    key: 'mym',
    label: 'MYM',
    icon: <TbHandLoveYou className="text-pink" size={18} />,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: <FaInstagram className="text-[#E1306C]" size={18} />,
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    icon: <FaTwitter className="text-[#1DA1F2]" size={18} />,
  },
  {
    key: 'twitch',
    label: 'Twitch',
    icon: <FaTwitch className="text-[#9146FF]" size={18} />,
  },
] as const;

const ADULT_SOCIALS = ['onlyfans', 'mym'] as const;
const PUBLIC_SOCIALS = ['instagram', 'twitter', 'twitch'] as const;

type SocialKey = (typeof SOCIALS)[number]['key'];

export const OnboardingStepper = () => {
  const { user, refreshProfile, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const isStripeActive = user?.stripeOnboardingStatus === 'actif';
  const stripeLabel = isStripeActive ? 'Compte actif' : 'Incomplet';
  const [stripeLoading, setStripeLoading] = useState(false);

  const [form, setForm] = useState<Record<string, any>>({
    username: user?.username || '',
    publicName: user?.publicName || '',
    email: user?.email || '',
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
      email: user?.email || prev.email,
    }));
  }, [user?.username, user?.publicName, user?.email]);

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
        payload.email = form.email;
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

  const openStripeConnect = async () => {
    if (!token) return;
    setStripeLoading(true);
    try {
      if (!user?.stripeConnectAccountId) {
        await StripeApi.createConnectAccount();
        await refreshProfile();
      }

      const { data } = await StripeApi.createAccountLink();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe link missing');
      }
    } catch (e) {
      console.error('stripe connect', e);
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const stripeReturn = url.searchParams.get('stripe');

    if (stripeReturn === 'return' || stripeReturn === 'refresh') {
      (async () => {
        try {
          await StripeApi.status();
          await refreshProfile();
        } catch (e) {
          console.error('stripe status refresh', e);
        } finally {
          url.searchParams.delete('stripe');
          window.history.replaceState({}, '', url.toString());
        }
      })();
    }
  }, [refreshProfile]);

  const renderSocialInput = ({ key, label, icon }: (typeof SOCIALS)[number]) => (
    <div
      key={key}
      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
    >
      <span className="shrink-0">{icon}</span>
      <input
        className="bg-transparent outline-none w-full text-white placeholder-white/40"
        placeholder={`Lien ${label}`}
        value={(form[key as SocialKey] as string) || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Tableau de bord</h2>
        <div className="flex items-center gap-2 text-sm">
          {isStripeActive ? (
            <span className="text-lg uppercase font-bold text-primary">Compte connecté</span>
          ) : (
            <span className="text-lg uppercase font-bold text-primary">Non connecté</span>
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
          <input
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <p className="text-xs text-white/40">
            Email utilisé pour les notifications et la sécurité. Il n’est pas affiché publiquement.
          </p>
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
              onChange={(e) => {
                const checked = e.target.checked;
                setForm((prev: any) => ({
                  ...prev,
                  is18Plus: checked,
                  ...(checked ? {} : { onlyfans: '', mym: '' }),
                }));
              }}
            />
            Contenu réservé aux majeurs (toggle 18+)
          </label>

          {/* Réseaux 18+ */}
          {form.is18Plus &&
            SOCIALS.filter(({ key }) => (ADULT_SOCIALS as readonly string[]).includes(key)).map(renderSocialInput)}

          {/* Réseaux publics */}
          {SOCIALS.filter(({ key }) => (PUBLIC_SOCIALS as readonly string[]).includes(key)).map(renderSocialInput)}
        </div>
      )}

      {currentStep === 3 && (
        <div
          className={`rounded-2xl border border-dashed border-white/20 p-6 space-y-3 text-sm text-white/70 transition ${isStripeActive ? 'opacity-40 cursor-not-allowed' : ''
            }`}
        >
          <p>
            Activez la réception de vos paiements pour recevoir l’argent directement sur votre compte.
            La configuration est simple et ne prend que quelques minutes.
          </p>

          <p>
            Statut actuel : <span className="text-pink font-semibold">{stripeLabel}</span>
          </p>

          <button
            type="button"
            onClick={openStripeConnect}
            disabled={isStripeActive || stripeLoading}
            className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition ${isStripeActive
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-primary text-white hover:opacity-90'
              }`}
          >
            {stripeLoading && <Loader2 className="animate-spin mr-2" size={16} />}
            {isStripeActive ? 'Compte Connecté' : 'Ouvrir le gestionnaire de paiement'}
          </button>
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
