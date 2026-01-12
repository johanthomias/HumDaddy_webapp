'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Link2, Share2 } from 'lucide-react';

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
};

const buildShareUrl = (username: string, originFallback?: string) => {
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    originFallback?.replace(/\/$/, '') ||
    '';
  const url = new URL(`${base}/${username}`);
  const params = new URLSearchParams(url.search);
  params.set('utm_source', 'share');
  params.set('utm_medium', 'dashboard');
  params.set('utm_campaign', 'wishlist');
  url.search = params.toString();
  return url.toString();
};

export const ShareModal = ({ isOpen, onClose, username }: ShareModalProps) => {
  const [publicUrl, setPublicUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const qrRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : undefined;
    setPublicUrl(buildShareUrl(username, origin));
    setCopied(false);
    setShareError('');
  }, [isOpen, username]);

  const handleCopy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    if (!publicUrl || typeof navigator === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma vitrine',
          text: 'Offre-moi un caprice 💛',
          url: publicUrl,
        });
      } catch (err) {
        console.error('share', err);
      }
    } else {
      setShareError('Partage non supporté, copiez le lien.');
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0b0c12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = png;
        link.download = `vitrine-${username}.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="relative max-w-xl w-full glass-panel p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Partager</p>
          <h3 className="text-2xl font-semibold">Ma vitrine</h3>
          <p className="text-white/60 text-sm">
            Envoie ton lien personnalisé vers ta vitrine ou le QR à tes daddy's.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 break-all">
                {publicUrl}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full bg-accent-pink text-night px-4 py-2 font-semibold"
              >
              <Link2 size={16} />
                {copied ? 'Copié ✅' : 'Copier'}
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold"
              >
                <Share2 size={16} />
                Partager
              </button>
            </div>
          </div>
          {shareError && <p className="text-xs text-yellow-300">{shareError}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 items-center">
          <div
            ref={qrRef}
            className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/50 p-4"
          >
            {publicUrl && (
              <QRCode value={publicUrl} bgColor="transparent" fgColor="#ffffff" size={180} />
            )}
          </div>
          <div className="space-y-3">
            <p className="text-white/70 text-sm">
              Scan rapide pour accéder à ta wishlist. Télécharge le QR pour l&apos;imprimer ou le
              partager.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
            >
              Télécharger le QR code (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
