import Link from 'next/link';
import { CheckoutButton } from '@/components/public/checkout-button';
import type { Gift, User } from '@/lib/types';

interface Props {
  params: { username: string };
  searchParams?: { tab?: string };
}

async function fetchWishlist(username: string): Promise<{ user: User; gifts: Gift[] } | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${baseUrl}/v1/gifts/public/${username}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PublicWishlistPage({ params, searchParams }: Props) {
  const data = await fetchWishlist(params.username);
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Wishlist introuvable</p>
      </main>
    );
  }

  const { user, gifts = [] } = data;
  const hasPaid = gifts.some((g) => g.isPurchased);
  const paidGifts = gifts.filter((g) => g.isPurchased);
  const activeGifts = gifts.filter((g) => !g.isPurchased);
  const tabActive = searchParams?.tab === 'paid' && hasPaid ? 'paid' : 'active';
  const displayedGifts = tabActive === 'paid' ? paidGifts : activeGifts;
  const paidCount = paidGifts.length;
  const activeCount = activeGifts.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-night to-obsidian px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="glass-panel p-8 flex flex-col md:flex-row md:items-center gap-6">
          {user.avatarUrl && (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl}
                alt={user.publicName || user.username || ''}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-white/60">
            {Object.entries(user.socialLinks ?? {})
              .filter((entry) => typeof entry[1] === 'string' && entry[1].length > 0)
              .map(([network, url]) => (
                <a key={network} href={url as string} className="underline" target="_blank" rel="noreferrer">
                  {network}
                </a>
              ))}
          </div>
        </header>

        <div className="flex items-center gap-3">
          <Link
            href={`/${params.username}`}
            className={`rounded-full px-4 py-2 text-sm border ${
              tabActive === 'active' ? 'border-accent-pink bg-accent-pink/10 text-white' : 'border-white/10 text-white/60'
            }`}
          >
            En cours ({activeCount})
          </Link>
          {hasPaid && (
            <Link
              href={`/${params.username}?tab=paid`}
              className={`rounded-full px-4 py-2 text-sm border ${
                tabActive === 'paid' ? 'border-accent-pink bg-accent-pink/10 text-white' : 'border-white/10 text-white/60'
              }`}
            >
              Déjà payés ({paidCount})
            </Link>
          )}
        </div>

        {hasPaid && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 text-sm">
            Déjà {paidCount} caprice(s) offert(s) 💛
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          {displayedGifts.map((gift) => {
            const media =
              gift.mediaUrls && gift.mediaUrls.length
                ? gift.mediaUrls
                : gift.imageUrl
                ? [gift.imageUrl]
                : [];
            const isPaid = Boolean(gift.isPurchased);
            const cardClasses = `glass-panel p-6 space-y-4 ${isPaid ? 'opacity-40 grayscale' : ''}`;
            return (
              <div key={gift._id} className={cardClasses}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{gift.title}</h3>
                    {gift.description && <p className="text-white/60 text-sm">{gift.description}</p>}
                  </div>
                  <p className="text-primary text-2xl font-bold whitespace-nowrap">{gift.price} €</p>
                </div>
                {media[0] ? (
                  <div className="space-y-3">
                    <div className="relative h-56 rounded-2xl overflow-hidden border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={media[0]} alt={gift.title} className="object-cover w-full h-full" />
                    </div>
                    {media.length > 1 && (
                      <div className="flex gap-3">
                        {media.slice(1).map((url) => (
                          <div key={url} className="flex-1 rounded-2xl overflow-hidden border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`${gift.title}-alt`} className="h-24 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-56 rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-white/30">
                    Pas d&apos;image
                  </div>
                )}
                {isPaid ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center rounded-full bg-white/10 text-white/60 py-3 font-semibold cursor-not-allowed"
                    >
                      Déjà payé
                    </button>
                    <p className="text-xs text-white/50 text-center">Déjà offert par un daddy 💛</p>
                  </div>
                ) : (
                  <CheckoutButton giftId={String(gift._id)} />
                )}
              </div>
            );
          })}
          {displayedGifts.length === 0 && <p className="text-white/50">Aucun cadeau pour le moment.</p>}
        </section>
      </div>
    </main>
  );
}
