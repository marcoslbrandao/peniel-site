// Datas sempre no fuso de Londres (a igreja) e no formato DD/MM/AAAA.
// Roda tanto no build (Node) quanto no navegador.

const FUSO = 'Europe/London';

function partesLondres(d = new Date()) {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    ano: Number(p.year), mes: Number(p.month), dia: Number(p.day),
    hora: Number(p.hour) % 24, minuto: Number(p.minute), semana: dias.indexOf(p.weekday),
  };
}

const dd = (n: number) => String(n).padStart(2, '0');

/** Próximo domingo de culto em DD/MM/AAAA (hoje, se for domingo antes das 20h). */
export function proximoDomingo(agora = new Date()): string {
  const p = partesLondres(agora);
  let soma = (7 - p.semana) % 7;
  if (soma === 0 && p.hora >= 20) soma = 7;
  const d = new Date(Date.UTC(p.ano, p.mes - 1, p.dia + soma));
  return `${dd(d.getUTCDate())}/${dd(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** Domingo entre 17h55 e 20h15, hora de Londres. */
export function aoVivoPeloHorario(agora = new Date()): boolean {
  const p = partesLondres(agora);
  const min = p.hora * 60 + p.minuto;
  return p.semana === 0 && min >= 17 * 60 + 55 && min <= 20 * 60 + 15;
}

/** Para o mini-calendário: "2026-10-14" → { dia: '14', mes: 'OUT' }. */
export function diaMes(iso: string) {
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const [, m, d] = iso.slice(0, 10).split('-');
  return { dia: d, mes: meses[Number(m) - 1] };
}

/** Próxima ocorrência de um dia da semana (0 = domingo), em ISO. */
export function proximaData(diaSemana: number, agora = new Date()): string {
  const p = partesLondres(agora);
  const soma = (diaSemana - p.semana + 7) % 7;
  const d = new Date(Date.UTC(p.ano, p.mes - 1, p.dia + soma));
  return d.toISOString().slice(0, 10);
}
