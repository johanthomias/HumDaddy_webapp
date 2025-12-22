import { Sparkles, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import Link from 'next/link';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) => (
  <div className="glass-panel p-6 flex flex-col gap-4 shadow-neon">
    <Icon className="text-accent-pink" />
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-night via-obsidian to-night">
      <section className="max-w-6xl mx-auto px-6 py-24 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="uppercase tracking-[0.4em] text-white/50 text-xs mb-4">wishlist premium</p>
          <h1 className="text-4xl lg:text-6xl font-semibold leading-tight">
            Offrez des cadeaux iconiques à vos créatrices favorites
          </h1>
          <p className="text-white/70 mt-6 text-lg">
            HumDaddy associe l&apos;élégance MYM et la puissance de Stripe Connect.
            Profils publics partageables, onboarding Express et cagnotte sécurisée.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/connexion" className="px-8 py-3 rounded-full bg-primary text-white font-semibold">
              Accéder à mon espace baby
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 rounded-full border border-white/30 text-white hover:border-white transition"
            >
              Découvrir la plateforme
            </Link>
          </div>
        </div>
        <div className="glass-panel p-8 space-y-6">
          <p className="text-white/60 text-sm">Workflow baby</p>
          <ul className="space-y-4 text-white">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">1</span>
              OTP SMS ultra rapide
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">2</span>
              Onboarding Stripe Connect Express
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">3</span>
              Wishlist partagée instantanément
            </li>
          </ul>
          <div className="rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-white/60">Cagnotte moyenne</p>
            <p className="text-4xl font-bold">3 420 €</p>
            <p className="text-xs text-white/40">Mise à jour en temps réel via Stripe</p>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={Sparkles}
          title="Landing premium"
          description="UI dark inspirée de MYM avec vitrines personnalisées et assets néon."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="OTP & modération"
          description="Connexion par SMS, admin panel avec reports et cashouts manuels."
        />
        <FeatureCard
          icon={CreditCard}
          title="Stripe Connect"
          description="Checkout public sans compte + commission plateforme configurable."
        />
        <FeatureCard
          icon={Smartphone}
          title="Expérience mobile"
          description="App Expo + push notifications Expo pour chaque paiement ou cashout."
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24 text-center space-y-6">
        <p className="text-white/60 uppercase tracking-[0.4em] text-xs">workflow daddy</p>
        <h2 className="text-3xl lg:text-4xl">Choisissez un cadeau sur la page publique et payez en 15 secondes</h2>
        <p className="text-white/70 max-w-3xl mx-auto">
          Les admirateurs n&apos;ont pas besoin de compte. Ils accèdent à la wishlist via un
          lien `/username`, sélectionnent un cadeau et finalisent le paiement via Stripe Checkout
          (message optionnel + anonymat). Succès / annulation gérés côté web & mobile.
        </p>
        <Link
          href="/connexion"
          className="inline-flex items-center justify-center px-10 py-3 rounded-full bg-accent-pink text-night font-semibold"
        >
          Tester la démo onboarding
        </Link>
      </section>
    </main>
  );
}
