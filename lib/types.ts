export type Role = 'baby' | 'admin';

export interface User {
  _id: string;
  phoneNumber: string;
  role: Role;
  username?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  contentType?: string;
  is18Plus?: boolean;
  socialLinks?: Record<string, string>;
  stripeConnectAccountId?: string;
  stripeOnboardingStatus?: string;
}

export interface Gift {
  _id: string;
  title: string;
  description?: string;
  mediaUrls?: string[];
  imageUrl?: string;
  price: number;
  currency: string;
  productLink?: string;
  isPurchased?: boolean;
}

export interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  message?: string;
  createdAt: string;
}

export interface CashoutRequest {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
}
