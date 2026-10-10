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
  className = 'field-input w-auto',
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
  const temDistritoEspecifico = distrito !== '' && distrito !== 'Todos';
  const concelhos = temDistritoEspecifico ? (CONCELHOS_POR_DISTRITO[distrito] ?? []) : [];
  // Nos formulários (sem "Todos") os dois selects ficam empilhados; damos-lhes espaço.
  const classeConcelho = allowTodos ? className : `${className} mt-2`;

  return (
    <>
      <select
        name={distritoName}
        aria-label="Distrito"
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
        aria-label="Concelho"
        className={classeConcelho}
        value={concelho}
        onChange={(e) => onConcelhoChange(e.target.value)}
        disabled={!temDistritoEspecifico}
      >
        {allowTodos && <option value="Todos">Todos os concelhos</option>}
        {!allowTodos && <option value="" disabled>Concelho</option>}
        {concelhos.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </>
  );
}
