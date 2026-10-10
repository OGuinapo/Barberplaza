import type { ReactNode } from 'react';

export function SkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="A carregar">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div className="card items-start" role="alert">
      <p className="font-semibold">Não foi possível carregar os dados.</p>
      <p className="meta">{message ?? 'Verifica a tua ligação e tenta novamente.'}</p>
      <button type="button" onClick={onRetry} className="btn btn-primary btn-sm mt-1">
        Tentar novamente
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card items-start">
      <p className="font-semibold">{title}</p>
      {text && <p className="meta">{text}</p>}
      {action}
    </div>
  );
}

export function ResultsBar({
  count,
  singular,
  plural,
  filtrado,
  onClear,
}: {
  count: number;
  singular: string;
  plural: string;
  filtrado: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 min-h-[32px]">
      <p className="meta" aria-live="polite">
        {count} {count === 1 ? singular : plural}
      </p>
      {filtrado && (
        <button type="button" onClick={onClear} className="text-[13px] font-semibold text-red hover:underline">
          Limpar filtros
        </button>
      )}
    </div>
  );
}
