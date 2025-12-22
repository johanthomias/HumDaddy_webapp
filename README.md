# HumDaddy – Web App (Next.js)

Landing & dashboard dark premium inspirés de MYM. Stack Next.js 14 App Router + Tailwind + Axios.

## Prérequis

- Node.js 18+
- npm 9+
- API backend démarrée (`NEXT_PUBLIC_API_URL`)

## Lancer en local

```bash
cd web-app
cp .env.example .env
npm install
npm run dev
```

L'app tourne sur `http://localhost:3000`.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Dev server Next.js |
| `npm run build` | Build production |
| `npm start` | Démarre le serveur buildé |
| `npm run lint` | Next lint |
| `npm run format` | Vérifie Prettier |

## Variables d'environnement

| Clé | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL de l'API Express (ex: http://localhost:4000) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Clé publishable Stripe (affichée côté client pour Checkout) |
| `BACKEND_API_URL` | (Optionnel) URL serveur pour les routes API Next (sinon fallback sur `NEXT_PUBLIC_API_URL`) |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (upload avatar + médias caprices) |

## UX livrées

- **Landing** premium (hero, USP, CTA) style MYM.
- **Connexion OTP** (flow 2 étapes) branchée sur `/v1/auth/*`.
- **Dashboard baby** : onboarding stepper (username, bio, social, 18+, Stripe), gestion wishlist, wallet Stripe, cashout manual.
- **Admin panel** : listes users, cashouts, transactions, reports.
- **Page publique `/username`** : profil + wishlist + CTA Stripe Checkout.

## Design system

- Tailwind + palette sombre (`night`, `obsidian`, `accent-pink`).
- Composants glassmorphism (`glass-panel`).
- Font Space Grotesk.

## Déploiement Vercel

1. Pousser le repo dediqué `web-app`.
2. Importer sur Vercel (Next.js). Build = `npm run build`, output = `.next`.
3. Ajouter les variables d'env `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `BACKEND_API_URL` et `BLOB_READ_WRITE_TOKEN`.
4. Activer le domaine custom souhaité (ex: `humdaddy.com`).
