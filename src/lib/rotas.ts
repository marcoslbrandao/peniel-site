// Links internos sempre passam por aqui: o mesmo código funciona no endereço
// de teste (/peniel-site/) e no domínio oficial (/).
export function rota(caminho = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpo = caminho.replace(/^\//, '');
  if (!limpo) return `${base}/`;
  if (limpo.startsWith('#')) return `${base}/${limpo}`;
  // Arquivo (tem extensão: logo.png) fica como está; página ganha a barra final.
  const ultimo = limpo.split(/[?#]/)[0].split('/').pop() ?? '';
  if (ultimo.includes('.') || /[?#]/.test(limpo)) return `${base}/${limpo}`;
  return `${base}/${limpo}/`;
}

export const MENU = [
  { rotulo: 'Início', href: '' },
  { rotulo: 'Sobre', href: 'sobre' },
  { rotulo: 'Agenda', href: 'agenda' },
  { rotulo: 'Mensagens', href: 'mensagens' },
  { rotulo: 'Contribua', href: 'contribua' },
  { rotulo: 'Contato', href: 'contato' },
];
