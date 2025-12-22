import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/components/providers/auth-provider';

const font = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HumDaddy – Wishlist premium pour babies',
  description: 'Landing + dashboard premium façon MYM, paiements Stripe Connect et OTP SMS.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${font.className} bg-night text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
