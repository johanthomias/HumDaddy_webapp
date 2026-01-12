'use client';

import { useEffect, useState } from 'react';
import { WalletApi } from '@/lib/api';

export const WalletWidget = () => {
  const [balances, setBalances] = useState({ available: 0, pending: 0, currency: 'eur' });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await WalletApi.summary();
        console.log(data)
        setBalances(data.balances);
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('wallet', error);
      }
    };
    fetchWallet();
  }, []);

  return (
    <div className="glass-panel p-8 space-y-6">
      <h2 className="text-2xl font-semibold">Portefeuille</h2>
      <p className="text-white/40 text-xs">Vous pouvez utiliser votre solde pour offrir des cadeaux ou le transférer sur votre compte bancaire afin d'acheter vos cadeaux dans votre wishlist.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-white/10 rounded-2xl p-4">
          <p className="text-white/50 text-sm">Disponible</p>
          <p className="text-3xl font-bold">{balances.available.toFixed(2)} €</p>
        </div>
        <div className="border border-white/10 rounded-2xl p-4">
          <p className="text-white/50 text-sm">En attente</p>
          <p className="text-3xl font-bold">{balances.pending.toFixed(2)} €</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-white/50 mb-2">Dernières attentions</p>
        <div className="space-y-2 max-h-40 overflow-auto pr-2">
          {transactions.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between text-sm">
              <span className="text-white/70">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
              <span className="font-semibold">
                {tx.amount} €
                <span className="text-xs text-white/50 ml-2">{tx.status}</span>
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-white/40 text-sm">Aucune transaction pour l'instant.</p>
          )}
        </div>
      </div>
    </div>
  );
};
