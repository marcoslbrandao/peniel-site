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

// ─── Consultas das páginas internas ─────────────────────────────────────────

export type EventoCompleto = Evento & {
  link_zoom: string | null;
  map_url: string | null;
  especial: boolean;
  cor: string | null;
  cta_texto: string | null;
  cta_url: string | null;
  imagem_url: string | null;
};

/** Agenda inteira: recorrentes + eventos com data (de hoje em diante). */
export async function agendaCompleta(): Promise<EventoCompleto[]> {
  const hoje = new Date().toISOString().slice(0, 10);
  const reserva = (fixtures.encontros as Evento[]).map((e) => ({
    ...e, link_zoom: null, map_url: null, especial: false, cor: null, cta_texto: null, cta_url: null, imagem_url: null,
  }));
  const linhas = await rest<EventoCompleto[]>(
    `agenda_eventos?select=*&or=(recorrente.eq.true,data.gte.${hoje})&order=recorrente.desc,dia_semana.asc,data.asc`,
    USAR_FIXTURES ? [...reserva, ...(fixtures.especiais as EventoCompleto[])] : reserva,
  );
  return linhas.length ? linhas : reserva;
}

export type MensagemCompleta = Mensagem & { conteudo: string };

/** Todas as mensagens (blog), com o texto inteiro, para as páginas próprias. */
export async function todasMensagens(): Promise<MensagemCompleta[]> {
  return rest<MensagemCompleta[]>(
    'mensagens?select=id,titulo,resumo,conteudo,imagem_url,autor,data&order=data.desc',
    USAR_FIXTURES
      ? (fixtures.mensagens as Mensagem[]).map((m) => ({ ...m, conteudo: `${m.resumo}\n\nEste é um texto de teste. No site de verdade aqui entra o conteúdo completo publicado pelo Painel Admin do app.` }))
      : [],
  );
}

/** Devocionais Peniel (grupo nulo), do mais novo para o mais antigo. */
export async function devocionais(limite = 60): Promise<Devocional[]> {
  return rest<Devocional[]>(
    `devocionais?select=id,titulo,versiculo,referencia,texto,data,imagem_url&grupo=is.null&order=data.desc&limit=${limite}`,
    USAR_FIXTURES ? (fixtures.devocional as Devocional[]) : [],
  );
}

/** Quebra um texto do app em blocos: parágrafos e subtítulos fixos do devocional. */
export function blocos(texto: string, opcoes: { subtitulos?: boolean } = {}): { tipo: 'p' | 'h' | 's'; texto: string }[] {
  const ROTULOS = /^(Para refletir|Ora[çc][ãa]o|Refer[êe]ncias|Aplica[çc][ãa]o|Desafio)\s*:?\s*/i;
  const saida: { tipo: 'p' | 'h' | 's'; texto: string }[] = [];
  for (const bruto of texto.replace(/\r/g, '').split(/\n\s*\n/)) {
    const linhas = bruto.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!linhas.length) continue;
    const m = linhas[0].match(ROTULOS);
    if (opcoes.subtitulos && ehSubtitulo(linhas)) {
      saida.push({ tipo: 's', texto: linhas[0] });
    } else if (m) {
      saida.push({ tipo: 'h', texto: m[1] });
      const resto = [linhas[0].slice(m[0].length), ...linhas.slice(1)].join(' ').trim();
      if (resto) saida.push({ tipo: 'p', texto: resto });
    } else {
      saida.push({ tipo: 'p', texto: linhas.join(' ') });
    }
  }
  return saida;
}

/** Subtitulo de mensagem: uma linha so, curta, sem pontuacao final e sem referencia biblica. */
function ehSubtitulo(linhas: string[]): boolean {
  if (linhas.length !== 1) return false;
  const l = linhas[0];
  if (l.length > 70 || l.includes('(')) return false;
  const miolo = l.replace(/^["\u201C\u201D]+|["\u201C\u201D]+$/g, '');
  return !/[.!?:;,]$/.test(miolo) && !/[.!?:;,)]$/.test(l);
}

/** Endereço amigável de uma mensagem: "reconstruindo-os-muros-1a2b3c". */
export function slugMensagem(m: { titulo: string; id: string }): string {
  const base = m.titulo
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${base || 'mensagem'}-${m.id.replace(/-/g, '').slice(0, 6)}`;
}
