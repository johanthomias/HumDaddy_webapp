'use client';

import { useState } from 'react';

type Props = {
  giftId: string;
};

export const CheckoutButton = ({ giftId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!giftId) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${baseUrl}/v1/checkout/gifts/${giftId}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymous: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Paiement indisponible');
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (err: any) {
      console.error('checkout', err);
      setError('Impossible de lancer le paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-full bg-accent-pink text-night py-3 font-semibold disabled:opacity-60"
      >
        {loading ? 'Redirection…' : 'Offrir ce caprice'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
