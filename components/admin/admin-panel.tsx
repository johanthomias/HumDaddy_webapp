'use client';

import { useEffect, useState } from 'react';
import { AdminApi } from '@/lib/api';
import type { User, CashoutRequest, Transaction } from '@/lib/types';
import { Pilotage } from './pilotage';

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [{ data: userData }, { data: txData }, { data: cashoutData }, { data: reportData }] =
          await Promise.all([
            AdminApi.users(),
            AdminApi.transactions(),
            AdminApi.cashouts(),
            AdminApi.reports(),
          ]);
        setUsers(userData);
        setTransactions(txData);
        setCashouts(cashoutData);
        setReports(reportData);
      } catch (error) {
        console.error('Erreur admin', error);
        setError('Impossible de charger les données admin');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="glass-panel p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-white/50 text-xs uppercase tracking-[0.4em]">admin</p>
        <h2 className="text-2xl font-semibold">Pilotage & Modération</h2>
        {loading && <p className="text-sm text-white/60">Chargement...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <Pilotage />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Utilisateurs</h3>
          <div className="space-y-2 max-h-72 overflow-auto pr-2 text-sm">
            {users
              .filter((user) => user.role === 'baby')
              .map((user) => {
                const badge = user.isBanned
                  ? '🟥 BANNI'
                  : user.isPublicVisible
                    ? '🟩 VITRINE ON'
                    : '🟨 VITRINE OFF';

              return (
                <div
                  key={user._id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-white/10 rounded-2xl px-4 py-2"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold">
                        {user.username || user.phoneNumber}
                      </span>
                      <div className="text-xs text-white/50 flex gap-2 items-center">
                        <span>{badge}</span>
                        {user.stripeOnboardingStatus && (
                          <span className="text-[11px] uppercase tracking-[0.2em]">
                            Stripe: {user.stripeOnboardingStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await AdminApi.updateVisibility(user._id, !user.isPublicVisible);
                          setUsers((prev) =>
                            prev.map((u) =>
                              u._id === user._id
                                ? { ...u, isPublicVisible: !u.isPublicVisible }
                                : u,
                            ),
                          );
                        }}
                        className="text-xs rounded-full border border-white/20 px-3 py-1"
                      >
                        {user.isPublicVisible ? 'Masquer' : 'Rendre visible'}
                      </button>

                      {user.isBanned ? (
                        <button
                          onClick={async () => {
                            await AdminApi.unbanUser(user._id);
                            setUsers((prev) =>
                              prev.map((u) =>
                                u._id === user._id
                                  ? { ...u, isBanned: false, banReason: undefined }
                                  : u,
                              ),
                            );
                          }}
                          className="text-xs rounded-full border border-white/20 px-3 py-1"
                        >
                          Réactiver
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const reason = prompt('Raison du ban ?') || 'Banni';
                            await AdminApi.banUser(user._id, reason);
                            setUsers((prev) =>
                              prev.map((u) =>
                                u._id === user._id
                                  ? {
                                    ...u,
                                    isBanned: true,
                                    isPublicVisible: false,
                                    banReason: reason,
                                  }
                                  : u,
                              ),
                            );
                          }}
                          className="text-xs rounded-full border border-red-400/60 px-3 py-1 text-red-200"
                        >
                          Bannir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
        <div>
          <h3 className="font-semibold mb-2">Cashouts</h3>
          <div className="space-y-2 max-h-48 overflow-auto pr-2 text-sm">
            {cashouts.map((cashout) => (
              <div key={cashout._id} className="flex justify-between border border-white/10 rounded-2xl px-4 py-2">
                <span>{cashout.baby?.username || 'baby'} · {cashout.amount}€</span>
                <span className="text-white/50">{cashout.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">Transactions</h3>
        {transactions.slice(0, 4).map((tx) => (
          <div key={tx._id} className="flex justify-between border border-white/10 rounded-2xl px-4 py-2">
            <span>{tx.gift?.title}</span>
            <span>{tx.amount} € · {tx.status}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">Reports</h3>
        {reports.slice(0, 4).map((report) => (
          <div key={report._id} className="border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-white/70">{report.description}</p>
            <p className="text-white/40 text-xs mt-1">Statut : {report.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
