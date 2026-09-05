import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isto só deve acontecer se te esqueceste do .env.local — ver README.md
  console.warn(
    'BarberPlaza: faltam as variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Vê o README.md.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
