// Mapa do site para o Google (penielchurch.org.uk/sitemap.xml).
// Gerado em cada build: entram as páginas fixas e uma linha por mensagem.
// Ficam de fora a 404 e as páginas que só redirecionam endereços antigos.
import type { APIRoute } from 'astro';
import { todasMensagens, slugMensagem } from '../lib/dados';
import { rota } from '../lib/rotas';

const FIXAS: { caminho: string; freq: string; prioridade: string }[] = [
  { caminho: '', freq: 'daily', prioridade: '1.0' },
  { caminho: 'planeje-sua-visita', freq: 'monthly', prioridade: '0.9' },
  { caminho: 'sobre', freq: 'monthly', prioridade: '0.8' },
  { caminho: 'agenda', freq: 'weekly', prioridade: '0.8' },
  { caminho: 'mensagens', freq: 'weekly', prioridade: '0.8' },
  { caminho: 'devocionais', freq: 'daily', prioridade: '0.7' },
  { caminho: 'o-app', freq: 'monthly', prioridade: '0.7' },
  { caminho: 'live-translation', freq: 'monthly', prioridade: '0.7' },
  { caminho: 'contribua', freq: 'monthly', prioridade: '0.6' },
  { caminho: 'contato', freq: 'yearly', prioridade: '0.6' },
  { caminho: 'politica-de-privacidade', freq: 'yearly', prioridade: '0.3' },
];

export const GET: APIRoute = async ({ site }) => {
  const url = (c: string) => new URL(rota(c), site).href;
  const hoje = new Date().toISOString().slice(0, 10);
  const mensagens = await todasMensagens();
  const linhas = [
    ...FIXAS.map((p) => `<url><loc>${url(p.caminho)}</loc><lastmod>${hoje}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.prioridade}</priority></url>`),
    ...mensagens.map((m) => `<url><loc>${url(`mensagens/${slugMensagem(m)}`)}</loc><lastmod>${m.data.slice(0, 10)}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linhas.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
