'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Eye, Pencil } from 'lucide-react';
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
  const [tab, setTab] = useState<'active' | 'paid'>('active');
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);

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

  const displayMedia = (gift: Gift) => {
    if (gift.mediaUrls && gift.mediaUrls.length) return gift.mediaUrls;
    if (gift.imageUrl) return [gift.imageUrl];
    return [];
  };

  const startEditGift = (gift: Gift) => {
    if (gift.isPurchased) {
      setError('Caprice déjà offert, non modifiable.');
      return;
    }
    setEditingGiftId(gift._id);
    setError('');
    setForm({
      title: gift.title || '',
      description: gift.description || '',
      price: gift.price || 50,
      productLink: gift.productLink || '',
      mediaUrls: displayMedia(gift),
    });

    // Pour que les prochains uploads se rangent dans un scope stable lié au caprice
    setUploadScope(gift._id);
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
    setEditingGiftId(null);
    setUploadScope(generateScope());
    setError('');
  };

  const submitGift = async () => {
    if (!form.title || form.mediaUrls.length === 0) {
      setError('Ajoutez au moins une image pour publier ce caprice.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingGiftId) {
        // ✏️ UPDATE
        await GiftApi.update(editingGiftId, form);
      } else {
        // ➕ CREATE
        await GiftApi.create(form);
      }

      resetForm();
      await fetchGifts();
    } catch (err) {
      console.error('submit gift', err);
      setError("Impossible d'enregistrer le caprice");
    } finally {
      setLoading(false);
    }
  };

  const deleteGift = async (id: string) => {
    const target = gifts.find((g) => g._id === id);
    if (target?.isPurchased) {
      setError('Caprice déjà offert, suppression impossible.');
      return;
    }
    try {
      await GiftApi.remove(id);
      if (editingGiftId === id) {
        resetForm();
      }
      await fetchGifts();
    } catch (err) {
      console.error('delete gift', err);
    }
  };

  const activeGifts = useMemo(() => gifts.filter((g) => !g.isPurchased), [gifts]);
  const paidGifts = useMemo(() => gifts.filter((g) => g.isPurchased), [gifts]);
  const displayedGifts = tab === 'paid' ? paidGifts : activeGifts;

  const paidCount = paidGifts.length;
  const activeCount = activeGifts.length;

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Caprices</h2>
        <span className="text-white/40 text-sm">{gifts.length} attention(s)</span>
      </div>
      <p className="text-xs text-white/40">Ajoutez vos caprices pour guider ceux qui savent donner.</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab('active')}
          className={`rounded-full px-4 py-2 text-sm border ${
            tab === 'active' ? 'border-accent-pink bg-accent-pink/10 text-white' : 'border-white/10 text-white/60'
          }`}
        >
          En cours ({activeCount})
        </button>
        <button
          onClick={() => paidCount > 0 && setTab('paid')}
          aria-disabled={paidCount === 0}
          className={`rounded-full px-4 py-2 text-sm border ${
            paidCount === 0
              ? 'border-white/5 text-white/30 cursor-not-allowed'
              : tab === 'paid'
                ? 'border-accent-pink bg-accent-pink/10 text-white'
                : 'border-white/10 text-white/60'
          }`}
        >
          Déjà payés ({paidCount})
        </button>
        {paidCount === 0 && (
          <span className="text-xs text-white/40">Aucun caprice offert pour le moment.</span>
        )}
      </div>

      {/* FORM */}
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
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 md:col-span-2"
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
          onClick={submitGift}
          disabled={loading}
          className="md:col-span-2 inline-flex items-center justify-center gap-2 bg-accent-pink text-white font-semibold rounded-full py-3"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : editingGiftId ? (
            'Mettre à jour le caprice'
          ) : (
            <>
              <PlusCircle size={18} />
              Ajouter à mes caprices
            </>
          )}
        </button>

        {editingGiftId && (
          <button
            type="button"
            onClick={resetForm}
            className="md:col-span-2 text-sm text-white/50 hover:text-white transition"
          >
            Annuler la modification
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="grid gap-4 md:grid-cols-2">
        {displayedGifts.map((gift) => {
          const media = displayMedia(gift);
          const isPaid = Boolean(gift.isPurchased);

          return (
            <div
              key={gift._id}
              className={`relative text-left rounded-2xl border p-4 space-y-3 transition ${
                editingGiftId === gift._id ? 'border-accent-pink/60' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className={`w-full text-left space-y-3 ${isPaid ? 'opacity-50 grayscale' : ''}`}>
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

                  {gift.isPurchased && (
                    <span className="text-xs text-green-400 border border-green-400/40 rounded-full px-2 py-1">
                      Financé
                    </span>
                  )}
                </div>

                {gift.description && <p className="text-white/50 text-sm line-clamp-2">{gift.description}</p>}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGift(gift)}
                  className="text-white/60 hover:text-white rounded-full border border-white/10 p-2"
                >
                  <Eye size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => startEditGift(gift)}
                  disabled={isPaid}
                  className={`text-white/60 hover:text-white rounded-full border border-white/10 p-2 ${
                    isPaid ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => deleteGift(gift._id)}
                  disabled={isPaid}
                  className={`text-white/40 hover:text-red-400 rounded-full border border-white/10 p-2 ${
                    isPaid ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {editingGiftId === gift._id && (
                <span className="absolute top-3 left-3 text-[11px] uppercase tracking-[0.2em] bg-accent-pink/20 text-accent-pink px-2 py-1 rounded-full">
                  édition
                </span>
              )}
            </div>
          );
        })}

        {displayedGifts.length === 0 && (
          <p className="text-white/40 text-sm">
            {tab === 'paid'
              ? 'Aucun caprice offert pour le moment.'
              : 'Ajoutez vos premiers caprices pour activer votre page publique.'}
          </p>
        )}
      </div>

      <ProductModal gift={selectedGift} onClose={() => setSelectedGift(null)} />
    </div>
  );
};
