# Manvitech — nuovo sito

Sito statico costruito con **Astro** + **Tailwind CSS v4** + **React** (solo per il form contatti), pensato per essere veloce, responsive e ottimizzato per SEO e visibilità AI.

## Stack tecnico

- **[Astro](https://astro.build)** — framework statico, genera solo HTML/CSS puro tranne dove serve interattività
- **Tailwind CSS v4** — design system con token custom (colori, font) in `src/styles/global.css`
- **React** — usato solo per il form contatti multi-step (`src/components/form/ContactWizard.tsx`)
- **MDX/Markdown** — per i contenuti di blog e local SEO, gestiti come Content Collections tipizzate
- **Netlify Forms** — gestione invii del form contatti, senza backend

## Struttura del progetto

```
src/
  content.config.ts       # Schema delle content collections (blog, local-seo, pages)
  content/
    blog/                  # Articoli del blog, un file .md per articolo
    local-seo/              # Landing page locali (una per città/zona)
    pages/                  # Contenuti delle pagine servizi
  components/
    sections/               # Sezioni riusabili della homepage
    form/                    # Form contatti (React)
    Header.astro / Footer.astro / Seo.astro
  layouts/
    Layout.astro             # Layout base con SEO, header, footer
  pages/                      # Routing: ogni file/cartella = una pagina
    blog/[...slug].astro      # Template articolo blog
    zone/[...slug].astro      # Template landing local SEO
    servizi/[...slug].astro   # Template pagina servizio
public/
  robots.txt                 # Include regole esplicite per crawler AI (GPTBot, ClaudeBot, ecc.)
  llms.txt                    # Riepilogo del sito per gli assistenti AI
```

## Come aggiungere contenuti

### Un nuovo articolo del blog

Crea un file in `src/content/blog/nome-articolo.md`:

```markdown
---
title: "Titolo dell'articolo"
description: "Descrizione per i motori di ricerca, max 160 caratteri"
pubDate: 2026-07-19
category: "Categoria"
tags: ["tag1", "tag2"]
---

Contenuto in Markdown...
```

Il file diventa automaticamente disponibile su `/blog/nome-articolo`.

### Una nuova landing page local SEO

Crea un file in `src/content/local-seo/nome-citta.md`:

```markdown
---
title: "Realizzazione siti internet a [Città]"
description: "Descrizione SEO per la città"
city: "Nome Città"
region: "Regione"
draft: false
---

Contenuto della pagina...
```

Diventa disponibile su `/zone/nome-citta`. Ricorda di togliere `draft: true` per pubblicarla.

## Sviluppo locale

```bash
npm install
npm run dev       # sviluppo su http://localhost:4321
npm run build     # build di produzione in /dist
npm run preview   # anteprima della build di produzione
```

## Deploy: GitHub + Netlify

1. Crea la repository su GitHub (vuota, senza README/licenza generati automaticamente).
2. Nella cartella del progetto:
   ```bash
   git init
   git add .
   git commit -m "Setup iniziale sito Manvitech"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/manvitech.git
   git push -u origin main
   ```
3. Su Netlify: "Add new site" → "Import an existing project" → collega la repository GitHub.
4. Le impostazioni di build sono già in `netlify.toml` (build command `npm run build`, publish `dist`): Netlify le rileva da sole.
5. In Site settings → Domain management, collega il dominio `manvitech.it`.
6. Il form contatti funziona subito grazie a Netlify Forms: le richieste compaiono in Site settings → Forms, da cui puoi impostare le notifiche email.

Da quel momento ogni `git push` su `main` fa partire automaticamente un nuovo deploy.

### Plugin Lighthouse (opzionale)

Il `netlify.toml` include `@netlify/plugin-lighthouse` per monitorare le performance ad ogni deploy. Se non ti serve, rimuovi il blocco `[[plugins]]` dal file.

## Cosa manca / prossimi passi

- Sostituire i contenuti segnaposto in Portfolio, Privacy Policy, Cookie Policy e Termini e condizioni con testi reali (per le pagine legali, meglio farle rivedere da un consulente)
- Scrivere le landing page local SEO reali in `src/content/local-seo/` (quella di esempio ha `draft: true`)
- Aggiungere altri articoli al blog
- Sostituire i riquadri con gradiente segnaposto con foto/screenshot reali dei progetti
- Valutare Decap CMS in futuro per un editor visuale dei Markdown (stesso login GitHub, nessun account nuovo)
