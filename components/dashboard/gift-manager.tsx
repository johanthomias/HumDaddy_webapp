'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { GiftApi } from '@/lib/api';
import type { Gift } from '@/lib/types';
import { MediaUploader } from '@/components/media/media-uploader';
import { ProductModal } from './product-modal';
import { useAuth } from '@/components/providers/auth-provider';

type GiftForm = {
  title: string;
  description: string;
  price: number;
  mediaUrls: string[];
  productLink: string;
};

const defaultForm: GiftForm = {
  title: '',
  description: '',
  price: 50,
  mediaUrls: [],
  productLink: '',
};

const generateScope = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}`;
};

export const GiftManager = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [form, setForm] = useState<GiftForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const { token } = useAuth();
  const [uploadScope, setUploadScope] = useState(generateScope);

  const fetchGifts = async () => {
    try {
      const { data } = await GiftApi.listMine();
      setGifts(data);
    } catch (err) {
      console.error('Erreur gifts', err);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const createGift = async () => {
    if (!form.title || form.mediaUrls.length === 0) {
      setError('Ajoutez au moins une image pour publier ce caprice.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await GiftApi.create(form);
      setForm({ ...defaultForm });
      setUploadScope(generateScope());
      await fetchGifts();
    } catch (err) {
      console.error('create gift', err);
      setError("Impossible d'ajouter le caprice");
    } finally {
      setLoading(false);
    }
  };

  const deleteGift = async (id: string) => {
    try {
      await GiftApi.remove(id);
      await fetchGifts();
    } catch (err) {
      console.error('delete gift', err);
    }
  };

  const displayMedia = (gift: Gift) => {
    if (gift.mediaUrls && gift.mediaUrls.length) return gift.mediaUrls;
    if (gift.imageUrl) return [gift.imageUrl];
    return [];
  };

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Caprices</h2>
        <span className="text-white/40 text-sm">{gifts.length} attention(s)</span>
      </div>
      <p className="text-xs text-white/40">Ajoutez vos caprices pour guider ceux qui savent donner.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          placeholder="Ce qui vous fait envie"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          placeholder="Prix (€)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          placeholder="Lien vers l’objet du désir"
          value={form.productLink}
          onChange={(e) => setForm({ ...form, productLink: e.target.value })}
        />
        <textarea
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 md:col-span-2"
          placeholder="Pourquoi ce caprice vous ferait plaisir…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="md:col-span-2">
          <MediaUploader
            label="Galerie photo"
            description="1 photo principale + 2 secondaires max."
            maxFiles={3}
            folder="gift"
            scope={uploadScope}
            existingUrls={form.mediaUrls}
            token={token}
            onChange={(urls) => setForm((prev) => ({ ...prev, mediaUrls: urls }))}
          />
        </div>
        {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
        <button
          onClick={createGift}
          disabled={loading}
          className="md:col-span-2 inline-flex items-center justify-center gap-2 bg-accent-pink text-white font-semibold rounded-full py-3"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
          Ajouter à mes caprices
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {gifts.map((gift) => {
          const media = displayMedia(gift);
          return (
            <button
              key={gift._id}
              className="relative text-left rounded-2xl border border-white/10 p-4 space-y-3 hover:border-white/30 transition"
              onClick={() => setSelectedGift(gift)}
            >
              {media[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media[0]}
                  alt={gift.title}
                  className="h-48 w-full rounded-2xl object-cover border border-white/10"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl bg-white/5 text-white/30">
                  Pas d&apos;image
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{gift.title}</h3>
                  <p className="text-primary font-semibold">{gift.price} €</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGift(gift._id);
                  }}
                  className="text-white/40 hover:text-red-400"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {gift.description && <p className="text-white/50 text-sm line-clamp-2">{gift.description}</p>}
              {gift.isPurchased && (
                <span className="text-xs text-green-400 border border-green-400/40 rounded-full px-2 py-1">
                  Financé
                </span>
              )}
            </button>
          );
        })}
        {gifts.length === 0 && (
          <p className="text-white/40 text-sm">Ajoutez vos premiers caprices pour activer votre page publique.</p>
        )}
      </div>

      <ProductModal gift={selectedGift} onClose={() => setSelectedGift(null)} />
    </div>
  );
};
