'use client';

import { useEffect, useRef } from 'react';

export default function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = anterior;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] bg-white rounded-4xl shadow-2xl p-6 sm:p-8 my-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-2xl leading-none text-muted hover:bg-paper2 hover:text-ink"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
