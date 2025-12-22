'use client';

import { useEffect, useState } from 'react';
import { CashoutApi } from '@/lib/api';

export const CashoutWidget = () => {
  const [amount, setAmount] = useState(200);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const fetchCashouts = async () => {
    try {
      const { data } = await CashoutApi.listMine();
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCashouts();
  }, []);

  const submit = async () => {
    try {
      await CashoutApi.create({ amount, note });
      setNote('');
      await fetchCashouts();
    } catch (error) {
      console.error('cashout', error);
    }
  };

  return (
    <div className="glass-panel p-8 space-y-6">
      <h2 className="text-2xl font-semibold">Retrait manuel</h2>
      <div className="grid gap-4">
        <input
          type="number"
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <textarea
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
          placeholder="Note (IBAN, dispo, etc.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="bg-primary text-white hover:text-white rounded-full py-3 font-semibold" onClick={submit}>
          Demander un retrait
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {history.map((cashout) => (
          <div key={cashout._id} className="flex items-center justify-between border border-white/10 rounded-2xl px-4 py-2">
            <span>{cashout.amount} €</span>
            <span className="text-white/50">{cashout.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
