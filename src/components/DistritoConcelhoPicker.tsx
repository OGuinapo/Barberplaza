'use client';

import { DISTRITOS, CONCELHOS_POR_DISTRITO } from '@/lib/locations';

export default function DistritoConcelhoPicker({
  distrito,
  concelho,
  onDistritoChange,
  onConcelhoChange,
  distritoName,
  concelhoName,
  allowTodos = false,
  className = 'field-input w-auto font-mono text-xs uppercase',
}: {
  distrito: string;
  concelho: string;
  onDistritoChange: (v: string) => void;
  onConcelhoChange: (v: string) => void;
  distritoName?: string;
  concelhoName?: string;
  allowTodos?: boolean;
  className?: string;
}) {
  const temDistrito = distrito && distrito !== 'Todos';
  const concelhos = temDistrito ? (CONCELHOS_POR_DISTRITO[distrito] ?? []) : [];

  return (
    <>
      <select
        name={distritoName}
        className={className}
        value={distrito}
        onChange={(e) => { onDistritoChange(e.target.value); onConcelhoChange(allowTodos ? 'Todos' : ''); }}
      >
        {allowTodos && <option value="Todos">Todos os distritos</option>}
        {!allowTodos && <option value="" disabled>Distrito</option>}
        {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select
        name={concelhoName}
        className={className}
        value={concelho}
        onChange={(e) => onConcelhoChange(e.target.value)}
        disabled={!temDistrito}
      >
        {allowTodos && <option value="Todos">Todos os concelhos</option>}
        {!allowTodos && <option value="" disabled>Concelho</option>}
        {concelhos.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </>
  );
}
