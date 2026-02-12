# Stripe Integration Setup Guide

## 🎯 Hvad er implementeret?

Jeg har forberedt hele Stripe integration strukturen for Adopteez, så når du har dine Stripe credentials, kan systemet:

✅ **Database tabeller oprettet:**
- `gift_codes` - Gavekoder og rabatkoder
- `payments` - Betalingstransaktioner
- `gift_code_usage` - Tracking af gavekode anvendelse

✅ **Stripe Webhook Edge Function deployed:**
- Modtager betalingsbekræftelser fra Stripe
- Opretter automatisk bruger i Supabase (hvis ny bruger)
- Aktiverer medlemskab med korrekt pakke
- Håndterer abonnementer (oprettelse, opdatering, annullering)
- Tracker gavekode anvendelse

✅ **Checkout side:**
- Komplet betalingsflow med pakkevalg
- Månedlig/Årlig betalingsmulighed
- Gavekode/Rabatkode felt
- Automatisk prisberegning med rabat
- Brugerregistrering for nye brugere

✅ **Admin Dashboard:**
- Oversigt over betalinger og medlemmer
- Se nye medlemmer med betalingsstatus
- Opret og administrer gavekoder
- Statistik over omsætning og medlemmer
- Filtrer og søg i betalinger

---

## 🔐 Næste Skridt: Stripe Opsætning

### 1. Opret eller Log ind på Stripe

Gå til [Stripe Dashboard](https://dashboard.stripe.com/register) og opret en konto eller log ind.

### 2. Hent API Nøgler

1. Gå til [Developers → API keys](https://dashboard.stripe.com/apikeys)
2. Find disse to nøgler:
   - **Publishable key** (starter med `pk_test_...` eller `pk_live_...`)
   - **Secret key** (starter med `sk_test_...` eller `sk_live_...`)

### 3. Tilføj Nøgler til `.env` filen

Åbn din `.env` fil og tilføj:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_din_publishable_key
STRIPE_SECRET_KEY=sk_test_din_secret_key
```

**VIGTIGT:** STRIPE_SECRET_KEY skal også tilføjes i Supabase Edge Functions secrets (dette håndteres automatisk).

### 4. Opret Stripe Checkout Session (Kræver Stripe SDK integration)

Når du har nøglerne, skal vi integrere Stripe Checkout. Dette kræver at vi:

1. Installerer Stripe JS library på frontend:
```bash
npm install @stripe/stripe-js
```

2. Opretter en edge function til at generere Checkout Session:
```bash
# Dette vil vi gøre når du har dine nøgler
```

### 5. Opsæt Webhook i Stripe Dashboard

1. Gå til [Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Klik "Add endpoint"
3. Tilføj din webhook URL:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Vælg følgende events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Kopier **Signing secret** (starter med `whsec_...`)

6. Tilføj til `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_din_webhook_secret
```

---

## 📋 Hvordan Systemet Virker

### Brugerflow:

1. **Bruger vælger pakke** → `/pricing`
2. **Går til checkout** → `/checkout?package=country_basic`
3. **Indtaster gavekode (valgfrit)** → Rabat beregnes automatisk
4. **Klikker "Gå til betaling"** → Stripe Checkout åbnes
5. **Betaler** → Stripe sender webhook
6. **Webhook modtaget** → Bruger oprettes automatisk i Supabase
7. **Medlemskab aktiveres** → Bruger får adgang til valgt pakke

### Admin Flow:

1. **Se nye medlemmer** → `/admin/payments`
2. **Filtrer efter betalingsstatus** → Completed, Pending, Failed
3. **Opret gavekoder** → Procent, Fast beløb, eller Gratis adgang
4. **Track statistik** → Total omsætning, Aktive medlemmer osv.

---

## 🧪 Test Mode vs Live Mode

Stripe har to modes:

- **Test Mode**: Brug test API keys (`pk_test_...` og `sk_test_...`)
- **Live Mode**: Brug live API keys (`pk_live_...` og `sk_live_...`)

**Test kort til Test Mode:**
- Successful payment: `4242 4242 4242 4242`
- Failed payment: `4000 0000 0000 0002`
- CVC: Any 3 digits
- Expiry: Any future date

---

## 🔧 Næste Integration Tasks (Når du har nøglerne)

1. **Opret Stripe Checkout Session Edge Function:**
   - Genererer Stripe Checkout URL med korrekt pris
   - Sender metadata (pakke, gavekode, brugerinfo)

2. **Integrer Stripe.js i checkout siden:**
   - Redirect til Stripe Checkout
   - Success/Cancel URLs

3. **Test hele flowet:**
   - Test betaling med test kort
   - Verificer bruger oprettes automatisk
   - Verificer medlemskab aktiveres
   - Test gavekoder

---

## 💳 Gavekode Types

Systemet understøtter 3 typer gavekoder:

1. **Procent Rabat** (`percentage`): fx 20% rabat
2. **Fast Beløb** (`fixed_amount`): fx 100 DKK rabat
3. **Gratis Adgang** (`free_access`): fx 3 måneder gratis

Admins kan oprette gavekoder direkte i `/admin/payments`

---

## 📊 Database Struktur

### `payments` tabel:
- Tracker alle betalinger
- Status: pending, completed, failed, refunded
- Linker til bruger, produkt og gavekode
- Gemmer Stripe payment intent ID for reference

### `gift_codes` tabel:
- Gavekoder med type og værdi
- Usage tracking (hvor mange gange brugt)
- Gyldighedsperiode
- Kan aktiveres/deaktiveres af admin

### `user_product_access` tabel:
- Tracker hvilket produkt hver bruger har adgang til
- Start og udløbsdato
- Aktiv/Inaktiv status

---

## 🆘 Support & Næste Skridt

Når du har dine Stripe nøgler, send dem til mig og jeg vil:

1. Færdiggøre Stripe Checkout integration
2. Teste hele betalingsflowet
3. Sikre webhook fungerer korrekt
4. Oprette test gavekoder

**Setup guide**: https://bolt.new/setup/stripe

---

## 🔒 Sikkerhed

- Stripe Secret Key gemmes KUN på serveren (Edge Functions)
- Publishable Key er sikker at bruge i frontend
- Webhook Secret verificerer at requests kommer fra Stripe
- Alle betalingsdata håndteres af Stripe (PCI compliant)
- Ingen kortinformation gemmes i vores database

---

**Status:** ✅ Database klar, ✅ Webhook deployed, ⏳ Venter på Stripe credentials
