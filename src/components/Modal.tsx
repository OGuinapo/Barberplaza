'use client';

export default function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-ink/55 z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-paper rounded-2xl max-w-[560px] w-full p-7 relative shadow-2xl mb-10">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-2xl leading-none text-ink"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
