// Como cada encontro da agenda aparece nos cartões da Home.
//
// Dia, horário, local e tipo vêm SEMPRE da agenda do app (`agenda_eventos`):
// mudou no Admin, muda no site. Só o nome de exibição e a frase de convite
// são do site, porque a descrição da agenda foi escrita para quem já é da
// igreja ("Reunião de oração e intercessão pelo Zoom.").

import type { Evento } from './dados';
import { DIAS, horaCurta } from './dados';

type Apresentacao = { titulo: string; convite: string };

const TEXTOS: { chave: RegExp; texto: Apresentacao }[] = [
  { chave: /culto/i, texto: { titulo: 'Culto Dominical', convite: 'O encontro principal da semana: louvor, a Palavra e tempo juntos depois.' } },
  { chave: /ora[çc][ãa]o/i, texto: { titulo: 'Sala de Oração', convite: 'Meia hora de oração juntos, de onde você estiver. Entra pelo link, sem senha.' } },
  { chave: /estudo/i, texto: { titulo: 'Estudo Bíblico', convite: 'Estudo semanal com espaço para perguntas. Pelo app você acompanha o material.' } },
  { chave: /jovens|alive/i, texto: { titulo: 'Peniel Alive', convite: 'O encontro dos jovens, sempre na casa de alguém. Pergunte onde é esta semana.' } },
];

const SELO: Record<Evento['tipo'], { rotulo: string; classe: string }> = {
  presencial: { rotulo: 'Presencial', classe: 'selo-presencial' },
  online: { rotulo: 'Online', classe: 'selo-online' },
  casa: { rotulo: 'Nas casas', classe: 'selo-casa' },
};

export type Cartao = {
  id: string;
  dia: string;
  titulo: string;
  quando: string; // "18h · Abbey Square"
  convite: string;
  selo: { rotulo: string; classe: string };
  ehEstudo: boolean;
};

function localCurto(e: Evento): string {
  if (/jovens|alive/i.test(e.nome)) return 'Jovens';
  return e.local.split(',')[0].trim();
}

export function cartoes(eventos: Evento[]): Cartao[] {
  return eventos
    .filter((e) => e.recorrente && e.dia_semana !== null)
    .map((e) => {
      const t = TEXTOS.find((x) => x.chave.test(e.nome))?.texto;
      return {
        id: e.id,
        dia: DIAS[e.dia_semana as number],
        titulo: t?.titulo ?? e.nome,
        quando: `${horaCurta(e.horario)} · ${localCurto(e)}`,
        convite: t?.convite ?? e.descricao ?? '',
        selo: SELO[e.tipo] ?? SELO.presencial,
        ehEstudo: /estudo/i.test(e.nome),
      };
    });
}
