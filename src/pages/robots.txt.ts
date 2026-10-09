// penielchurch.org.uk/robots.txt — libera tudo e aponta o mapa do site.
import type { APIRoute } from 'astro';
import { rota } from '../lib/rotas';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(rota('sitemap.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
