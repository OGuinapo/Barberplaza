'use client';

import { useEffect } from 'react';
import NextImage from 'next/image';
import { iniciais } from '@/lib/utils';

export function Avatar({
  nome,
  url,
  size = 56,
  className = '',
}: {
  nome: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden bg-navy text-white flex items-center justify-center font-display font-bold ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {url ? (
        <NextImage src={url} alt={`Foto de ${nome}`} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden="true">{iniciais(nome)}</span>
      )}
    </div>
  );
}

export function PhotoGrid({
  fotos,
  nome,
  onOpen,
}: {
  fotos: string[];
  nome: string;
  onOpen: (i: number) => void;
}) {
  if (fotos.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {fotos.map((u, i) => (
        <button
          key={u}
          type="button"
          onClick={() => onOpen(i)}
          className="relative aspect-square rounded-lg overflow-hidden bg-paper2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          aria-label={`Ver foto ${i + 1} de ${nome}`}
        >
          <NextImage src={u} alt={`Trabalho de ${nome}, foto ${i + 1}`} fill sizes="180px" className="object-cover" />
        </button>
      ))}
    </div>
  );
}

export function Lightbox({
  fotos,
  index,
  onClose,
  onIndex,
  alt,
}: {
  fotos: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  alt: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'ArrowRight' && index < fotos.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [index, fotos.length, onClose, onIndex]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Fotografia em ecrã inteiro"
    >
      <div className="relative w-full h-full max-w-4xl">
        <NextImage src={fotos[index]} alt={`${alt}, foto ${index + 1}`} fill sizes="100vw" className="object-contain" priority />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white text-2xl leading-none hover:bg-white/25"
      >
        ×
      </button>
      {index > 0 && (
        <button
          type="button"
          onClick={() => onIndex(index - 1)}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 text-white text-2xl hover:bg-white/25"
        >
          ‹
        </button>
      )}
      {index < fotos.length - 1 && (
        <button
          type="button"
          onClick={() => onIndex(index + 1)}
          aria-label="Foto seguinte"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 text-white text-2xl hover:bg-white/25"
        >
          ›
        </button>
      )}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs">
        {index + 1} / {fotos.length}
      </p>
    </div>
  );
}
