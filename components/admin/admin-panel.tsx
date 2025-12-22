'use client';

import { useEffect, useState } from 'react';
import { AdminApi } from '@/lib/api';

export const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cashouts, setCashouts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
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
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="glass-panel p-8 space-y-6">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-[0.4em]">admin</p>
        <h2 className="text-2xl font-semibold">Modération & cashouts</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Utilisateurs</h3>
          <div className="space-y-2 max-h-48 overflow-auto pr-2 text-sm">
            {users.map((user) => (
              <div key={user._id} className="flex justify-between border border-white/10 rounded-2xl px-4 py-2">
                <span>{user.username || user.phoneNumber}</span>
                <span className="text-white/50">{user.role}</span>
              </div>
            ))}
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
