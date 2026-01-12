import axios from 'axios';
import type { User, Gift, CashoutRequest, Transaction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: false,
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthApi = {
  requestOtp: (phoneNumber: string) => api.post('/v1/auth/request-otp-sms', { phoneNumber }),
  verifyOtp: (payload: { phoneNumber: string; code: string }) =>
    api.post<{ accessToken: string; user: User; isNewUser?: boolean }>('/v1/auth/verify-otp-sms', payload),
};

export const AdminAuthApi = {
  login: (payload: { email: string; password: string }) =>
    api.post<{ accessToken: string; user: User }>('/v1/admin/auth/login', payload),
  me: () => api.get<User>('/v1/admin/auth/me'),
};

export const StripeApi = {
  createConnectAccount: () => api.post<{ accountId: string }>('/v1/stripe/connect/create'),
  createAccountLink: () => api.post<{ url: string }>('/v1/stripe/connect/create-account-link'),
  status: () => api.get('/v1/stripe/connect/status'),
};


export const UserApi = {
  me: () => api.get<User>('/v1/users/me'),
  update: (payload: Partial<User>) => api.put<User>('/v1/users/me', payload),
};

export const GiftApi = {
  listMine: () => api.get<Gift[]>('/v1/gifts'),
  create: (payload: Partial<Gift>) => api.post<Gift>('/v1/gifts', payload),
  update: (id: string, payload: Partial<Gift>) => api.put<Gift>(`/v1/gifts/${id}`, payload),
  remove: (id: string) => api.delete(`/v1/gifts/${id}`),
  publicWishlist: (username: string) => api.get(`/v1/gifts/public/${username}`),
};

export const WalletApi = {
  summary: () => api.get('/v1/wallet'),
};

export const CashoutApi = {
  listMine: () => api.get<CashoutRequest[]>('/v1/cashouts'),
  create: (payload: { amount: number; note?: string }) => api.post('/v1/cashouts', payload),
};

export const AdminApi = {
  users: () => api.get<User[]>('/v1/admin/users'),
  transactions: () => api.get<Transaction[]>('/v1/admin/transactions'),
  cashouts: () => api.get<CashoutRequest[]>('/v1/cashouts/admin'),
  reports: () => api.get('/v1/reports/admin'),
  updateVisibility: (id: string, isPublicVisible: boolean) =>
    api.patch<User>(`/v1/admin/users/${id}/visibility`, { isPublicVisible }),
  banUser: (id: string, reason?: string) => api.patch<User>(`/v1/admin/users/${id}/ban`, { reason }),
  unbanUser: (id: string) => api.patch<User>(`/v1/admin/users/${id}/unban`),
  pilotage: (range: '24h' | '7d' | '30d') => api.get(`/v1/admin/pilotage?range=${range}`),
};

export default api;
