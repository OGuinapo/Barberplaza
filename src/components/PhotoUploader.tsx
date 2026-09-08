'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthProvider';

const MAX_FOTOS = 6;
const MAX_MB = 5;

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
      if (file.size > MAX_MB * 1024 * 1024) {
        setErro(`"${file.name}" é maior que ${MAX_MB}MB e foi ignorada.`);
        continue;
      }
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('fotos').upload(path, file);
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
      <p className="text-xs text-muted font-mono">Até {MAX_FOTOS} fotos, máx {MAX_MB}MB cada.</p>
    </div>
  );
}
