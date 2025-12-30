import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getBackendBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folderType = String(formData.get('folderType') || '');
    const scope = String(formData.get('scope') || 'tmp');
console.log("formData :", file)
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Fichier manquant' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Format non supporté' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'Fichier trop volumineux' }, { status: 400 });
    }

    if (!['profile', 'gift'].includes(folderType)) {
      return NextResponse.json({ message: 'Dossier invalide' }, { status: 400 });
    }

    const userRes = await fetch(`${getBackendBaseUrl()}/v1/users/me`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const user = await userRes.json();
    const userId = user?._id || user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 400 });
    }

    const originalName = file.name || 'media.jpg';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
    const uniqueId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const fileName = `${uniqueId}.${extension}`;

    const pathname =
      folderType === 'profile'
        ? `${userId}/profile/${fileName}`
        : `${userId}/gifts/${scope}/${fileName}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ message: 'Token Blob manquant' }, { status: 500 });
    }

    const blob = await put(pathname, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error('Upload error', error);
    return NextResponse.json({ message: 'Erreur upload' }, { status: 500 });
  }
}
