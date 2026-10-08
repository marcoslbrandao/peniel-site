// Tudo o que é "fixo" do site num lugar só. Trocar aqui muda o site inteiro.

export const SUPABASE_URL = 'https://yudulaqsqhzbbarhxbnr.supabase.co';
// Chave ANÔNIMA (pública por desenho, é a mesma que vai dentro do app).
// Quem protege os dados é a RLS de cada tabela, não esta chave.
export const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZHVsYXFzcWh6YmJhcmh4Ym5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTkzNjgsImV4cCI6MjA5NDg3NTM2OH0.X66clWugVNeANpfb78mkTY-bu6SNMPIAZMJfZf6kEr8';

export const LINKS = {
  // Link único: iPhone → App Store, Android → Google Play, computador → página com QR.
  app: 'https://app.penielchurch.org.uk',
  appStore: 'https://apps.apple.com/app/id6776841788',
  googlePlay: 'https://play.google.com/store/apps/details?id=org.uk.penielchurch.app',
  youtube: 'https://www.youtube.com/@PenielChurchOfficial',
  youtubeAoVivo: 'https://www.youtube.com/@PenielChurchOfficial/live',
  instagram: 'https://www.instagram.com/penielchurchofficial/',
  facebook: 'https://www.facebook.com/penielchurchofficial',
  email: 'info@penielchurch.org.uk',
  mapa:
    'https://www.google.com/maps/place/Peniel+Church+Reading/@51.4554719,-0.9672378,17z/data=!3m1!4b1!4m6!3m5!1s0x48769b63829b7c6b:0x76c21b83b425775d!8m2!3d51.4554719!4d-0.9672378!16s%2Fg%2F11fct12yxy',
  estacionamentoHorseBarge: 'https://maps.app.goo.gl/XUTqnqXvuNxruiyb8',
  estacionamentoQueensRoad: 'https://maps.app.goo.gl/9Gr1vQEMCKDaVy7PA',
  checkout: `${SUPABASE_URL}/functions/v1/create-checkout-session`,
};

// Mesma chave do index.html do app.penielchurch.org.uk.
// No dia em que o Google Play aprovar: trocar para true.
export const GOOGLE_PLAY_NO_AR = false;

export const OFERTA_VALORES = [10, 25, 50, 100, 200];
export const OFERTA_MAXIMO = 5000; // mesmo teto da Edge Function

// Culto de domingo: usado no hero e para acender o "AO VIVO" pelo horário.
export const CULTO = { diaSemana: 0, inicio: '18:00', fim: '20:00', local: 'Abbey Square', cidade: 'Reading, RG1 3BE' };
