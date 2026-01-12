export type Role = 'baby' | 'admin';

export interface User {
  _id: string;
  phoneNumber: string;
  role: Role;
  username?: string;
  email?: string;
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
  contentType?: string;
  isPublicVisible: boolean;
  isBanned: boolean;
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
  gift: any;
  status: 'pending' | 'succeeded' | 'failed';
  message?: string;
  createdAt: string;
}

export interface CashoutRequest {
  _id: string;
  baby: any;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
}

export type PilotageRange = '24h' | '7d' | '30d';

export interface PilotageResponse {
  range: PilotageRange;
  from: string;
  to: string;
  kpis: {
    amountGross: number;
    platformFees: number;
    amountNet: number;
    txSucceeded: number;
    txPending: number;
    giftsCreated: number;
    giftsFunded: number;
    cashoutsPendingCount: number;
    cashoutsPendingTotal: number;
    babiesActiveCount: number;
  };
  alerts: {
    stripeRestricted: {
      count: number;
      items: { userId: string; username?: string; publicName?: string; status?: string }[];
    };
    missingTransfers: {
      count: number;
      items: {
        txId: string;
        giftTitle?: string;
        babyUsername?: string;
        amountNet?: number;
        createdAt?: string;
      }[];
    };
    cashoutsFromInactiveBabies: {
      count: number;
      items: {
        cashoutId: string;
        babyUsername?: string;
        status?: string;
        amount?: number;
        createdAt?: string;
      }[];
    };
  };
}
