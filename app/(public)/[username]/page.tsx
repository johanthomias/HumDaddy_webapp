interface Props {
  params: { username: string };
}

async function fetchWishlist(username: string) {
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

export default async function PublicWishlistPage({ params }: Props) {
  const data = await fetchWishlist(params.username);
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Wishlist introuvable</p>
      </main>
    );
  }

  const { user, gifts = [] } = data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-night to-obsidian px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="glass-panel p-8 flex flex-col md:flex-row md:items-center gap-6">
          {user.avatarUrl && (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.publicName || user.username} className="object-cover w-full h-full" />
            </div>
          )}
          <div>
            <p className="text-white/50 text-xs">wishlist /{user.username}</p>
            <h1 className="text-4xl font-semibold">{user.publicName || user.username}</h1>
            <p className="text-white/60 mt-3 max-w-2xl">{user.bio}</p>
            <div className="flex flex-wrap gap-3 mt-4 text-sm text-white/60">
              {user.socialLinks &&
                Object.entries(user.socialLinks).map(([network, url]) =>
                  url ? (
                    <a key={network} href={url} className="underline" target="_blank" rel="noreferrer">
                      {network}
                    </a>
                  ) : null,
                )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {gifts.map((gift: any) => {
            const media =
              gift.mediaUrls && gift.mediaUrls.length
                ? gift.mediaUrls
                : gift.imageUrl
                ? [gift.imageUrl]
                : [];
            return (
              <div key={gift._id} className="glass-panel p-6 space-y-4">
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
                        {media.slice(1).map((url: string) => (
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
                {gift.isPurchased ? (
                  <span className="inline-flex rounded-full bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">
                    Cadeau déjà financé
                  </span>
                ) : gift.productLink ? (
                  <a
                    href={gift.productLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center rounded-full bg-accent-pink text-night py-3 font-semibold"
                  >
                    Voir le produit
                  </a>
                ) : (
                  <button className="w-full rounded-full bg-accent-pink text-night py-3 font-semibold">Offrir</button>
                )}
              </div>
            );
          })}
          {gifts.length === 0 && <p className="text-white/50">Aucun cadeau pour le moment.</p>}
        </section>
      </div>
    </main>
  );
}
