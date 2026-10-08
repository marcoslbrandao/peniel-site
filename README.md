# Site da Peniel Church (Astro)

Site novo, sem WordPress, alimentado pelo **mesmo Supabase do app**. Publicar um
devocional, uma mensagem ou mudar a agenda pelo Painel Admin do app atualiza o
site sozinho (o GitHub refaz o site de hora em hora).

## Rodar no Mac

```bash
npm install
npm run dev            # http://localhost:4321/peniel-site/  (dados reais do Supabase)
npm run dev:offline    # mesmo site com dados de teste (src/lib/fixtures.json)
```

## Onde mexer

| Quero mudar…                         | Arquivo |
|--------------------------------------|---------|
| Links (app, lojas, YouTube, mapa)    | `src/lib/config.ts` |
| Google Play aprovado                 | `src/lib/config.ts` → `GOOGLE_PLAY_NO_AR = true` |
| Textos da Home                       | `src/pages/index.astro` |
| Frase de convite de cada encontro    | `src/lib/encontros.ts` |
| Cores, tamanhos, versão de celular   | `src/styles/global.css` |
| Menu                                 | `src/lib/rotas.ts` |

Dia, horário e local dos encontros **não ficam no código**: vêm de `agenda_eventos`.

## De onde vem cada dado

| Bloco da Home        | Fonte |
|----------------------|-------|
| A semana na Peniel   | `agenda_eventos` (recorrentes) |
| Próximo estudo       | RPC `proximo_encontro_publico('estudo_biblico')` |
| Devocional Peniel    | `devocionais` (grupo nulo, mais recente, com `imagem_url`) |
| Últimas mensagens    | `mensagens` (3 mais recentes) |
| Selo AO VIVO         | domingo 17h55–20h15 (Londres) **ou** `traducao_ao_vivo.ativa` |
| Oferta               | Edge Function `create-checkout-session` → Stripe |

Se o Supabase não responder no build, o site sai assim mesmo, com valores de reserva.

## Publicação

`.github/workflows/publicar.yml` publica no GitHub Pages a cada push e de hora em hora.
Endereço de teste: `https://marcoslbrandao.github.io/peniel-site/`.
