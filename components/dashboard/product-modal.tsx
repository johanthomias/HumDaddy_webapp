'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Gift } from '@/lib/types';

type ProductModalProps = {
  gift: Gift | null;
  onClose: () => void;
};

export const ProductModal = ({ gift, onClose }: ProductModalProps) => {
  const media = useMemo(() => {
    if (!gift) return [];
    if (gift.mediaUrls && gift.mediaUrls.length) return gift.mediaUrls;
    if (gift.imageUrl) return [gift.imageUrl];
    return [];
  }, [gift]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [gift?._id]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!gift) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl glass-panel p-6 md:p-10 space-y-6 overflow-y-auto max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
              {media[activeIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media[activeIndex]}
                  alt={gift.title}
                  className="h-72 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl bg-white/5 text-white/40">
                  Aucune image
                </div>
              )}
            </div>
            {media.length > 1 && (
              <div className="flex gap-2">
                {media.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setActiveIndex(index)}
                    className={`flex-1 overflow-hidden rounded-2xl border ${
                      index === activeIndex ? 'border-accent-pink' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`media-${index}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">caprice</p>
              <h2 className="text-3xl font-semibold text-white">{gift.title}</h2>
              <p className="text-primary text-2xl font-bold mt-2">{gift.price} €</p>
            </div>
            {gift.description && <p className="text-white/70 text-sm">{gift.description}</p>}
            {gift.isPurchased && (
              <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                Financé
              </span>
            )}
            {gift.productLink && (
              <a
                href={gift.productLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold"
              >
                Voir le lien produit <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
