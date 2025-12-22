'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Trash2, UploadCloud } from 'lucide-react';

type MediaUploaderProps = {
  label?: string;
  description?: string;
  maxFiles?: number;
  existingUrls?: string[];
  folder: 'profile' | 'gift';
  scope?: string;
  token: string | null;
  onChange?: (urls: string[]) => void;
  disabled?: boolean;
};

type UploadState = 'idle' | 'uploading' | 'error';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MediaUploader = ({
  label,
  description,
  maxFiles = 1,
  existingUrls = [],
  folder,
  scope = 'tmp',
  token,
  onChange,
  disabled,
}: MediaUploaderProps) => {
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const [status, setStatus] = useState<UploadState>('idle');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUrls(existingUrls);
  }, [JSON.stringify(existingUrls)]);

  const remainingSlots = maxFiles - urls.length;
  const canUpload = Boolean(token) && !disabled && remainingSlots > 0 && status !== 'uploading';

  const handleFiles = async (files: FileList | null) => {
    if (!files || !canUpload) return;
    setError('');
    setStatus('uploading');
    const selected = Array.from(files).slice(0, remainingSlots);

    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          throw new Error('Format non supporté (jpg/png/webp uniquement)');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Chaque fichier doit faire moins de 5 Mo');
        }
        const url = await uploadToBlob(file);
        uploaded.push(url);
      }

      const next = [...urls, ...uploaded];
      setUrls(next);
      onChange?.(next);
    } catch (err: any) {
      console.error('upload media', err);
      setError(err?.message || 'Upload impossible');
      setStatus('error');
      return;
    } finally {
      setStatus('idle');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadToBlob = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderType', folder);
    formData.append('scope', scope);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || 'Upload impossible');
    }

    const data = await res.json();
    return data.url as string;
  };

  const removeImage = (url: string) => {
    const next = urls.filter((item) => item !== url);
    setUrls(next);
    onChange?.(next);
  };

  const triggerSelect = () => {
    if (!canUpload) return;
    fileInputRef.current?.click();
  };

  const previews = useMemo(() => urls, [urls]);

  return (
    <div className="space-y-3">
      {label && <p className="text-sm text-white/70">{label}</p>}
      {description && <p className="text-xs text-white/40">{description}</p>}

      <div
        role="button"
        tabIndex={0}
        onClick={triggerSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') triggerSelect();
        }}
        className={`rounded-2xl border border-dashed border-white/20 p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition ${
          canUpload ? 'hover:border-white/40' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        <UploadCloud className="text-white/60" />
        <p className="text-white/70 text-sm">
          {canUpload ? 'Déposer ou cliquer pour choisir un fichier' : 'Limite atteinte'}
        </p>
        <p className="text-xs text-white/40">JPEG, PNG ou WebP - 5 Mo max</p>
        {status === 'uploading' && (
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Loader2 className="animate-spin" size={14} />
            Upload en cours…
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp"
        multiple={maxFiles > 1}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((url) => (
            <div key={url} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="media preview"
                className="h-28 w-full rounded-2xl object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white/80 opacity-0 group-hover:opacity-100 transition"
                aria-label="Supprimer media"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
