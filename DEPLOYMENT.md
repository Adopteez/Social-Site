# Deployment Guide - Adopteez

## GitHub Setup

### 1. Opret GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DIT-BRUGERNAVN/adopteez.git
git push -u origin main
```

### 2. Beskyt Credentials

Din `.env` fil er automatisk ekskluderet fra Git via `.gitignore`.
VIGTIG: Commit aldrig dine Supabase credentials til GitHub!

## Deployment til Vercel (Anbefalet)

### Trin 1: Opret Vercel Konto
1. Gå til [vercel.com](https://vercel.com)
2. Sign up med din GitHub konto

### Trin 2: Import Projekt
1. Klik på "Add New..." → "Project"
2. Import dit GitHub repository
3. Vercel detecterer automatisk at det er et Vite projekt

### Trin 3: Konfigurer Environment Variables
I Vercel dashboard, tilføj følgende environment variables:

```
VITE_SUPABASE_URL=https://xbdwcpmldtmqmavvfasb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-FVIJVTfi5NV0RsqoMACVA_YuRwiaRo
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Trin 4: Deploy
1. Klik "Deploy"
2. Vent på build (ca. 1-2 minutter)
3. Din site er nu live! 🎉

### Automatiske Deployments
Hver gang du pusher til `main` branch, deployer Vercel automatisk den nye version.

## Deployment til Netlify (Alternativ)

### Trin 1: Opret Netlify Konto
1. Gå til [netlify.com](https://netlify.com)
2. Sign up med din GitHub konto

### Trin 2: Import Projekt
1. Klik "Add new site" → "Import an existing project"
2. Vælg GitHub og dit repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Trin 3: Environment Variables
Under "Site settings" → "Environment variables", tilføj:

```
VITE_SUPABASE_URL=https://xbdwcpmldtmqmavvfasb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-FVIJVTfi5NV0RsqoMACVA_YuRwiaRo
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Trin 4: Deploy
Klik "Deploy site" og vent på build.

## Supabase Edge Functions

### Deploy Edge Functions
Edge functions skal deployes separat til Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link til dit projekt
supabase link --project-ref xbdwcpmldtmqmavvfasb

# Deploy alle functions
supabase functions deploy analytics
supabase functions deploy blogposts
supabase functions deploy chat
supabase functions deploy create-hubspot-ticket
supabase functions deploy hubspot-ticket-updates
supabase functions deploy hubspot-webhook
supabase functions deploy moderation
supabase functions deploy process-admin-requests
supabase functions deploy seo
supabase functions deploy users
```

## Custom Domain (Valgfrit)

### Vercel
1. Gå til Project Settings → Domains
2. Tilføj dit domain (fx `adopteez.com`)
3. Opdater DNS records hos din domain provider

### Netlify
1. Gå til Site settings → Domain management
2. Tilføj custom domain
3. Opdater DNS records

## Checklist Efter Deployment

- [ ] Site er tilgængeligt på den nye URL
- [ ] Login/Signup virker
- [ ] Database forbindelse virker (kan se grupper, profiler osv)
- [ ] Billeder loader korrekt
- [ ] Edge functions virker (test HubSpot webhook hvis relevant)
- [ ] SSL certifikat er aktivt (https)
- [ ] Custom domain er sat op (hvis relevant)

## Support

Ved problemer:
- Tjek Vercel/Netlify build logs
- Verificer environment variables er sat korrekt
- Tjek Supabase dashboard for database errors
- Se browser console for frontend errors

## Sikkerhed

VIGTIG: Dine Supabase credentials i `.env` filen må ALDRIG committes til GitHub!

Anon key er sikker at dele (den er designet til client-side brug), men service role key skal holdes hemmelig.
