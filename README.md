# BarberPlaza — código de produção

Este é o código real do BarberPlaza, pronto a publicar com domínio próprio.
Usa Next.js (o site em si) + Supabase (a base de dados) + Vercel (onde o site fica alojado).
Mantém a mesma identidade visual do protótipo — cores, listra de barbeiro, tipografia.

## O que precisas de instalar no teu computador

- **Node.js** (versão 18 ou mais recente) — [nodejs.org](https://nodejs.org)
- Uma conta grátis em **[supabase.com](https://supabase.com)**
- Uma conta grátis em **[vercel.com](https://vercel.com)**
- Editor de código, ex: **[VS Code](https://code.visualstudio.com)** (opcional, mas recomendado)

---

## Passo 1 — Criar a base de dados (Supabase)

1. Vai a [supabase.com](https://supabase.com) e cria um novo projeto (grátis).
2. Espera 1-2 minutos enquanto o projeto é criado.
3. No menu lateral, abre **SQL Editor**.
4. Abre o ficheiro `supabase/schema.sql` (está nesta pasta), copia todo o conteúdo, cola no SQL Editor e clica **Run**.
5. Isto cria todas as tabelas (barbeiros, barbearias, vagas, formações, candidaturas) já prontas a usar.
6. Vai a **Project Settings → API**. Vais precisar de dois valores daqui:
   - **Project URL**
   - **anon public key**

## Passo 2 — Configurar o projeto no teu computador

1. Descarrega/extrai esta pasta para o teu computador.
2. Abre um terminal dentro da pasta `barberplaza-app` e corre:
   ```
   npm install
   ```
3. Copia o ficheiro `.env.local.example` e renomeia a cópia para `.env.local`.
4. Abre o `.env.local` e cola os valores que copiaste do Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=a-tua-chave-aqui
   ```
5. Corre o site localmente para testar:
   ```
   npm run dev
   ```
6. Abre [http://localhost:3000](http://localhost:3000) no browser — o site deve aparecer a funcionar, já ligado à tua base de dados real.

## Passo 3 — Publicar online (Vercel)

1. Cria uma conta em [vercel.com](https://vercel.com) (podes entrar com GitHub).
2. A forma mais simples: envia esta pasta para um repositório no GitHub, depois em Vercel clica **"Add New Project"** e escolhe esse repositório.
   - Alternativa sem GitHub: instala a CLI da Vercel (`npm i -g vercel`) e corre `vercel` dentro da pasta do projeto.
3. Quando a Vercel pedir as variáveis de ambiente, adiciona as mesmas duas do `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Clica **Deploy**. Em 1-2 minutos tens um link público a funcionar (algo como `barberplaza.vercel.app`).

## Passo 4 — Ligar o domínio `barberplaza.com`

1. Regista o domínio num registrador (ex: Namecheap, GoDaddy, ou diretamente na Vercel em **Domains**).
2. No painel do projeto na Vercel, vai a **Settings → Domains** e adiciona `barberplaza.com`.
3. A Vercel dá-te os registos DNS exatos para configurares no sítio onde registaste o domínio (normalmente um registo tipo A ou CNAME).
4. Espera a propagação de DNS (pode levar de minutos a algumas horas).

---

## Limitações desta versão (MVP) — importante saber

- **Sem contas de utilizador/login ainda.** Tal como no protótipo, qualquer pessoa pode editar/remover qualquer registo. Isto é aceitável para validar a ideia, mas antes de teres tração real, o próximo passo técnico importante é adicionar autenticação (o Supabase tem isto embutido — chama-se "Supabase Auth" e não é difícil de adicionar depois).
- **Fotos por link (URL), não upload.** Para adicionar upload real de imagens, o Supabase também tem isso embutido ("Supabase Storage") — é um passo seguinte natural.
- **Candidaturas não têm painel de leitura.** Ficam guardadas na base de dados, mas só as consegues ver diretamente no painel do Supabase (Table Editor → candidaturas) até construíres uma área de login para barbearias.

## Estrutura do projeto

```
barberplaza-app/
  supabase/schema.sql       ← esquema da base de dados (correr uma vez no Supabase)
  src/
    app/
      layout.tsx             ← estrutura global, fontes, SEO
      page.tsx                ← página inicial
      emprego/page.tsx        ← vagas
      barbeiros/page.tsx      ← portefólios
      barbearias/page.tsx     ← perfis de barbearias
      formacao/page.tsx       ← cursos, workshops, eventos
      globals.css              ← cores e estilos partilhados
    components/
      Header.tsx, Footer.tsx, Modal.tsx
    lib/
      supabaseClient.ts        ← ligação à base de dados
      types.ts                 ← tipos e listas (cidades, especialidades)
```
