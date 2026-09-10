'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';

const MAX_FOTOS = 6;
const MAX_MB_ORIGINAL = 30;
const MAX_DIMENSAO = 1920;
const QUALIDADE = 0.82;

function comprimirImagem(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSAO || height > MAX_DIMENSAO) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSAO) / width);
          width = MAX_DIMENSAO;
        } else {
          width = Math.round((width * MAX_DIMENSAO) / height);
          height = MAX_DIMENSAO;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas não suportado')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob); else reject(new Error('Falha ao comprimir'));
        },
        'image/jpeg',
        QUALIDADE
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler a imagem')); };
    img.src = url;
  });
}

export default function PhotoUploader({
  fotos,
  onChange,
}: {
  fotos: string[];
  onChange: (urls: string[]) => void;
}) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setErro('');
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user) return;
    if (fotos.length + files.length > MAX_FOTOS) {
      setErro(`Máximo de ${MAX_FOTOS} fotos.`);
      e.target.value = '';
      return;
    }
    setUploading(true);
    const novasUrls: string[] = [];
    for (const file of files) {
      if (file.size > MAX_MB_ORIGINAL * 1024 * 1024) {
        setErro(`"${file.name}" é maior que ${MAX_MB_ORIGINAL}MB e foi ignorada.`);
        continue;
      }
      let ficheiroFinal: Blob = file;
      try {
        ficheiroFinal = await comprimirImagem(file);
      } catch {
        ficheiroFinal = file;
      }
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('fotos').upload(path, ficheiroFinal, {
        contentType: 'image/jpeg',
      });
      if (error) {
        setErro('Erro ao enviar "' + file.name + '": ' + error.message);
        continue;
      }
      const { data } = supabase.storage.from('fotos').getPublicUrl(path);
      novasUrls.push(data.publicUrl);
    }
    onChange([...fotos, ...novasUrls]);
    setUploading(false);
    e.target.value = '';
  }

  function remover(url: string) {
    onChange(fotos.filter((f) => f !== url));
  }

  function moverFoto(de: number, para: number) {
    if (de === para) return;
    const arr = [...fotos];
    const [item] = arr.splice(de, 1);
    arr.splice(para, 0, item);
    onChange(arr);
  }

  function handlePointerDown(e: React.PointerEvent, i: number) {
    setDragIndex(i);
    setOverIndex(i);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragIndex === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const alvo = el?.closest('[data-idx]');
    if (alvo) {
      const idx = Number(alvo.getAttribute('data-idx'));
      if (!Number.isNaN(idx)) setOverIndex(idx);
    }
  }

  function handlePointerUp() {
    if (dragIndex !== null && overIndex !== null && overIndex !== dragIndex) {
      moverFoto(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {fotos.map((url, i) => (
          <div
            key={url}
            data-idx={i}
            onPointerDown={(e) => handlePointerDown(e, i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 touch-none select-none cursor-grab active:cursor-grabbing transition-transform ${
              dragIndex === i ? 'opacity-60 scale-95 border-red' : overIndex === i && dragIndex !== null ? 'border-red' : 'border-line'
            }`}
          >
            <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
            {i === 0 && (
              <span className="absolute bottom-0.5 left-0.5 bg-ink/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">CAPA</span>
            )}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => remover(url)}
              className="absolute top-0.5 right-0.5 bg-ink/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
        {fotos.length < MAX_FOTOS && (
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-line flex items-center justify-center cursor-pointer text-muted text-xs text-center px-1">
            {uploading ? 'A enviar…' : '+ Foto'}
            <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
          </label>
        )}
      </div>
      {erro && <p className="text-xs text-red font-mono">{erro}</p>}
      <p className="text-xs text-muted font-mono">
        Até {MAX_FOTOS} fotos. Mantém o dedo na foto e arrasta para reordenar — a primeira é a capa.
      </p>
    </div>
  );
}
