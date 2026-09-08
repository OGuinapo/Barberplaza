'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';

const MAX_FOTOS = 6;
const MAX_MB_ORIGINAL = 30; // limite do ficheiro tal como sai do telemóvel, antes de comprimir
const MAX_DIMENSAO = 1920;  // maior lado da foto depois de comprimida, em pixels
const QUALIDADE = 0.82;     // qualidade JPEG (0-1)

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
        // se a compressão falhar por algum motivo, envia o ficheiro original na mesma
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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {fotos.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
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
      <p className="text-xs text-muted font-mono">Até {MAX_FOTOS} fotos. Comprimidas automaticamente ao enviar.</p>
    </div>
  );
}
