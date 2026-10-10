'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import CandidatarForm from '@/components/CandidatarForm';

export default function VagaCandidatar({ vagaId, vagaTitulo }: { vagaId: string; vagaTitulo: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setAberto(true)}>
        Candidatar a esta vaga
      </button>
      {aberto && (
        <Modal onClose={() => setAberto(false)}>
          <CandidatarForm vagaId={vagaId} vagaTitulo={vagaTitulo} />
        </Modal>
      )}
    </>
  );
}
