export type Barbeiro = {
  id: string;
  nome: string;
  cidade: string;
  telemovel: string;
  email: string | null;
  anos_experiencia: string | null;
  bio: string;
  foto_url: string | null;
  especialidades: string[];
  criado_em: string;
};

export type Barbearia = {
  id: string;
  nome: string;
  cidade: string;
  morada: string | null;
  telemovel: string;
  email: string | null;
  sobre: string;
  foto_url: string | null;
  criado_em: string;
};

export type Vaga = {
  id: string;
  barbearia_id: string;
  titulo: string;
  tipo: string;
  cidade: string;
  descricao: string;
  criado_em: string;
  barbearias?: { nome: string } | null; // via join
};

export type Formacao = {
  id: string;
  titulo: string;
  tipo: string;
  organizador: string;
  cidade: string;
  data: string | null;
  preco: string | null;
  link: string | null;
  descricao: string;
  criado_em: string;
};

export const CIDADES = [
  'Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Setúbal', 'Aveiro',
  'Guimarães', 'Leiria', 'Viseu', 'Évora', 'Funchal', 'Ponta Delgada',
  'Cascais', 'Almada', 'Outra',
];

export const ESPECIALIDADES = [
  'Corte clássico', 'Degradê / Fade', 'Barba & navalha', 'Coloração',
  'Alisamento', 'Desenho de barba', 'Corte infantil', 'Tratamentos capilares',
];

export const TIPOS_VAGA = [
  'Tempo inteiro', 'Meio-tempo', 'Cadeira livre (aluguer)', 'Freelancer / Recibos verdes',
];

export const TIPOS_FORMACAO = ['Curso', 'Workshop', 'Evento'];
