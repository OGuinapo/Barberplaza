-- ============================================================
-- BARBERPLAZA — esquema da base de dados (Supabase / Postgres)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- BARBEIROS ----------
create table if not exists barbeiros (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cidade text not null,
  telemovel text not null,
  email text,
  anos_experiencia text,
  bio text not null,
  foto_url text,
  especialidades text[] default '{}',
  criado_em timestamptz default now()
);

-- ---------- BARBEARIAS ----------
create table if not exists barbearias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cidade text not null,
  morada text,
  telemovel text not null,
  email text,
  sobre text not null,
  foto_url text,
  criado_em timestamptz default now()
);

-- ---------- VAGAS ----------
create table if not exists vagas (
  id uuid primary key default uuid_generate_v4(),
  barbearia_id uuid references barbearias(id) on delete cascade,
  titulo text not null,
  tipo text not null check (tipo in ('Tempo inteiro','Meio-tempo','Cadeira livre (aluguer)','Freelancer / Recibos verdes')),
  cidade text not null,
  descricao text not null,
  criado_em timestamptz default now()
);

-- ---------- FORMAÇÃO & EVENTOS ----------
create table if not exists formacoes (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  tipo text not null check (tipo in ('Curso','Workshop','Evento')),
  organizador text not null,
  cidade text not null,
  data date,
  preco text,
  link text,
  descricao text not null,
  criado_em timestamptz default now()
);

-- ---------- CANDIDATURAS ----------
create table if not exists candidaturas (
  id uuid primary key default uuid_generate_v4(),
  vaga_id uuid references vagas(id) on delete cascade,
  nome text not null,
  contacto text not null,
  mensagem text,
  criado_em timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table barbeiros enable row level security;
alter table barbearias enable row level security;
alter table vagas enable row level security;
alter table formacoes enable row level security;
alter table candidaturas enable row level security;

create policy "Leitura pública barbeiros" on barbeiros for select using (true);
create policy "Leitura pública barbearias" on barbearias for select using (true);
create policy "Leitura pública vagas" on vagas for select using (true);
create policy "Leitura pública formacoes" on formacoes for select using (true);

create policy "Inserção pública barbeiros" on barbeiros for insert with check (true);
create policy "Inserção pública barbearias" on barbearias for insert with check (true);
create policy "Inserção pública vagas" on vagas for insert with check (true);
create policy "Inserção pública formacoes" on formacoes for insert with check (true);
create policy "Inserção pública candidaturas" on candidaturas for insert with check (true);

create policy "Remoção pública barbeiros" on barbeiros for delete using (true);
create policy "Remoção pública barbearias" on barbearias for delete using (true);
create policy "Remoção pública vagas" on vagas for delete using (true);
create policy "Remoção pública formacoes" on formacoes for delete using (true);

create index if not exists idx_barbeiros_cidade on barbeiros(cidade);
create index if not exists idx_barbearias_cidade on barbearias(cidade);
create index if not exists idx_vagas_cidade on vagas(cidade);
create index if not exists idx_vagas_barbearia on vagas(barbearia_id);
