'use client';

import { useEffect, useState } from 'react';
import { AdminApi } from '@/lib/api';
import type { PilotageRange, PilotageResponse } from '@/lib/types';

const ranges: PilotageRange[] = ['24h', '7d', '30d'];

export const Pilotage = () => {
  const [range, setRange] = useState<PilotageRange>('24h');
  const [data, setData] = useState<PilotageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (selected: PilotageRange) => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await AdminApi.pilotage(selected);
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les KPI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const k = data?.kpis;
  const alerts = data?.alerts;

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Pilotage</p>
          <h3 className="text-2xl font-semibold">KPI clés</h3>
        </div>
        <div className="flex items-center gap-2">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-2 text-sm border ${
                range === r ? 'border-accent-pink bg-accent-pink/10 text-white' : 'border-white/10 text-white/60'
              }`}
            >
              {r === '24h' ? '24h' : r === '7d' ? '7 jours' : '30 jours'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-white/60 text-sm">Chargement...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard label="Montant encaissé" value={`${k?.amountGross?.toFixed(2) || '0.00'} €`} />
            <KpiCard label="Fees plateforme" value={`${k?.platformFees?.toFixed(2) || '0.00'} €`} />
            <KpiCard label="Net vers babies" value={`${k?.amountNet?.toFixed(2) || '0.00'} €`} />
            <KpiCard
              label="Transactions"
              value={`${k?.txSucceeded || 0} réussies / ${k?.txPending || 0} pending`}
            />
            <KpiCard
              label="Caprices"
              value={`${k?.giftsCreated || 0} créés / ${k?.giftsFunded || 0} financés`}
            />
            <KpiCard
              label="Cashouts en attente"
              value={`${k?.cashoutsPendingCount || 0} req · ${(k?.cashoutsPendingTotal || 0).toFixed(2)} €`}
            />
            <KpiCard label="Babies actives" value={`${k?.babiesActiveCount || 0}`} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60 uppercase tracking-[0.3em]">Alertes</span>
              <span className="text-xs text-white/40">Mises à jour en temps réel</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AlertCard
                title="Stripe restreint/désactivé"
                color="yellow"
                count={alerts?.stripeRestricted.count || 0}
                items={alerts?.stripeRestricted.items?.map((u) => `${u.username || 'user'} · ${u.status}`) || []}
              />
              <AlertCard
                title="Transactions sans transfert"
                color="red"
                count={alerts?.missingTransfers.count || 0}
                items={
                  alerts?.missingTransfers.items?.map(
                    (tx) => `${tx.giftTitle || 'caprice'} · ${tx.amountNet || 0}€ · ${tx.babyUsername || ''}`,
                  ) || []
                }
              />
              <AlertCard
                title="Cashouts de babies non actives"
                color="orange"
                count={alerts?.cashoutsFromInactiveBabies.count || 0}
                items={
                  alerts?.cashoutsFromInactiveBabies.items?.map(
                    (c) => `${c.babyUsername || 'user'} · ${c.amount || 0}€`,
                  ) || []
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const KpiCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
    <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
  red: 'bg-red-500/15 text-red-200 border-red-500/30',
  orange: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
};

const AlertCard = ({
  title,
  color,
  count,
  items,
}: {
  title: string;
  color: 'yellow' | 'red' | 'orange';
  count: number;
  items: string[];
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm text-white/70">{title}</p>
      <span className={`text-xs px-3 py-1 rounded-full border ${colorMap[color]}`}>{count}</span>
    </div>
    <div className="space-y-1 text-xs text-white/60">
      {items.slice(0, 10).map((line, idx) => (
        <div key={idx} className="truncate">
          {line}
        </div>
      ))}
      {items.length === 0 && <p className="text-white/30">Aucune alerte</p>}
    </div>
  </div>
);
