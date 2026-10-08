// Camada de dados: lê o Supabase do app NA HORA DO BUILD.
//
// Por que no build (e não no navegador de cada visitante):
//  - a página chega pronta, sem "piscar" vazia, e o Google lê tudo;
//  - o site continua de pé mesmo se o Supabase estiver lento.
// O GitHub Actions refaz o build de hora em hora (e a cada push), então um
// devocional publicado pelo app aparece no site em até 1 hora.
//
// Se o Supabase não responder, cada função devolve um valor de reserva —
// o build NUNCA quebra por causa dos dados.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import fixtures from './fixtures.json';

const USAR_FIXTURES = !!process.env.PENIEL_FIXTURES;

async function rest<T>(caminho: string, reserva: T, init?: RequestInit): Promise<T> {
  if (USAR_FIXTURES) return reserva;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
      ...init,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return (await r.json()) as T;
  } catch (e) {
    console.warn(`[peniel] Supabase indisponível em "${caminho.split('?')[0]}": usando reserva.`, String(e).slice(0, 200));
    return reserva;
  }
}

// ─── Tipos (colunas conferidas nas migrações do app) ────────────────────────

export type Evento = {
  id: string;
  nome: string;
  tipo: 'presencial' | 'online' | 'casa';
  recorrente: boolean;
  dia_semana: number | null; // 0 = domingo
  data: string | null;
  horario: string;
  local: string;
  descricao: string | null;
};

export type Devocional = {
  id: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  texto: string;
  data: string;
  imagem_url: string | null;
};

export type Mensagem = {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  autor: string;
  data: string;
};

// ─── Consultas ──────────────────────────────────────────────────────────────

/** Encontros semanais (recorrentes), ordenados de domingo a sábado. */
export async function encontrosDaSemana(): Promise<Evento[]> {
  const linhas = await rest<Evento[]>(
    'agenda_eventos?select=id,nome,tipo,recorrente,dia_semana,data,horario,local,descricao&recorrente=eq.true&order=dia_semana.asc',
    fixtures.encontros as Evento[],
  );
  return linhas.length ? linhas : (fixtures.encontros as Evento[]);
}

/** Devocional Peniel mais recente (o mesmo da Home do app: grupo nulo). */
export async function devocionalDeHoje(): Promise<Devocional | null> {
  const linhas = await rest<Devocional[]>(
    'devocionais?select=id,titulo,versiculo,referencia,texto,data,imagem_url&grupo=is.null&order=data.desc&limit=1',
    USAR_FIXTURES ? (fixtures.devocional as Devocional[]) : [],
  );
  return linhas[0] ?? null;
}

/** As três mensagens (blog) mais recentes. */
export async function ultimasMensagens(): Promise<Mensagem[]> {
  return rest<Mensagem[]>(
    'mensagens?select=id,titulo,resumo,imagem_url,autor,data&order=data.desc&limit=3',
    USAR_FIXTURES ? (fixtures.mensagens as Mensagem[]) : [],
  );
}

/** Data do próximo Estudo Bíblico (RPC pública, não expõe o link do Zoom). */
export async function proximoEstudo(): Promise<string | null> {
  const linhas = await rest<{ data: string; horario: string }[]>(
    'rpc/proximo_encontro_publico',
    USAR_FIXTURES ? fixtures.proximoEstudo : [],
    { method: 'POST', body: JSON.stringify({ p_grupo: 'estudo_biblico' }) },
  );
  return linhas[0]?.data ?? null;
}

// ─── Formatação ─────────────────────────────────────────────────────────────

export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** Padrão do app: DD/MM/AAAA. Recebe "2026-10-14" ou ISO completo. */
export function dataBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/** "18h00" / "18:00" / "18h" → "18h"; "20h30" → "20h30". */
export function horaCurta(h: string): string {
  const m = h.match(/(\d{1,2})\s*[h:]\s*(\d{2})?/i);
  if (!m) return h;
  return m[2] && m[2] !== '00' ? `${Number(m[1])}h${m[2]}` : `${Number(m[1])}h`;
}

/** Corta um texto no limite de palavras, sem quebrar no meio. */
export function resumir(texto: string, max = 220): string {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max)).replace(/[,.;:!?-]+$/, '') + '…';
}
