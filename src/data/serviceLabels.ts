// Etichette brevi per menu, footer e card: i titoli completi restano per H1 e SEO.
const labels: Record<string, string> = {
  'consulenza-sito-esistente': 'Consulenza sito esistente',
  'sito-hackerato-pulizia-e-ripristino': 'Sito hackerato',
  'migrazione-hosting': 'Migrazione hosting',
  'velocita-sito-a-pacchetto': 'Sito lento',
  'email-aziendale-in-spam': 'Email in spam',
  'aggiornamento-sicuro-wordpress': 'Aggiornamento WordPress e PHP',
  'google-business-profile': 'Google Business Profile',
  'pacchetto-ore-prepagato': 'Pacchetto ore prepagato',
  'gestione-domini-e-dns': 'Domini e DNS',
};
export const shortLabel = (id: string, title: string) => labels[id] ?? title;
export const EMERGENCY_TEL = '+393450639886';
export const EMERGENCY_TEL_LABEL = '+39 345 0639886';
