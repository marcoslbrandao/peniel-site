import { defineConfig } from 'astro/config';

// SITE e BASE vêm do ambiente para o mesmo código servir em dois lugares:
//  - endereço de teste no GitHub Pages: SITE=https://marcoslbrandao.github.io  BASE=/peniel-site
//  - domínio oficial (na virada):       SITE=https://penielchurch.org.uk         BASE=/
export default defineConfig({
  site: process.env.SITE || 'https://marcoslbrandao.github.io',
  base: process.env.BASE || '/peniel-site',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
