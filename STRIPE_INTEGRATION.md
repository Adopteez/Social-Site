# Stripe Integration Guide - Adopteez

Denne guide hjælper dig med at sætte Stripe betalinger op for Adopteez medlemskabspakker.

## Oversigt

Adopteez bruger Stripe til at håndtere:
- Månedlige og årlige abonnementer
- Sikker kortbetaling
- Gavekoder og rabatter
- Automatisk medlemskabsaktivering

## Produkter i Systemet

Databasen indeholder allerede 4 medlemskabspakker:

1. **Country Membership Basic** - 39 DKK/måned eller 328 DKK/år
2. **Country Membership Plus** - 59 DKK/måned eller 496 DKK/år
3. **World Wide Membership Basic** - 49 DKK/måned eller 412 DKK/år
4. **World Wide Membership Plus** - 69 DKK/måned eller 580 DKK/år

---

## Trin 1: Opret Stripe Konto

1. Gå til [stripe.com](https://stripe.com/dk) og opret en konto
2. Gennemfør virksomhedsverifikation
3. Aktiver betalingsmetoder (Dankort, Visa, Mastercard osv.)

---

## Trin 2: Hent Stripe API Nøgler

1. Log ind på [Stripe Dashboard](https://dashboard.stripe.com)
2. Klik på **Developers** i venstre menu
3. Vælg **API keys**
4. Du skal bruge:
   - **Publishable key** (starter med `pk_test_` eller `pk_live_`)
   - **Secret key** (starter med `sk_test_` eller `sk_live_`)
   - **Webhook signing secret** (oprettes i næste trin)

---

## Trin 3: Konfigurer Environment Variables

### Lokalt (.env fil)

Tilføj til din `.env` fil:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_din_publishable_key_her
```

### I Supabase (Edge Functions)

Stripe secret keys er automatisk konfigureret i Supabase. Du behøver ikke gøre noget.

---

## Trin 4: Opsæt Stripe Webhook

Webhooks tillader Stripe at fortælle din platform når en betaling er gennemført.

1. Gå til [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Klik på **Add endpoint**
3. Indtast webhook URL:
   ```
   https://xbdwcpmldtmqmavvfasb.supabase.co/functions/v1/stripe-webhook
   ```
4. Vælg følgende events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Klik **Add endpoint**
6. Kopier **Signing secret** (starter med `whsec_`)
7. Dette secret er automatisk konfigureret i Supabase

---

## Trin 5: Synkroniser Produkter til Stripe

Nu skal produkterne fra databasen oprettes i Stripe.

### Automatisk Metode (Anbefalet)

Vi har lavet en edge function der gør dette automatisk:

1. Log ind som **admin** eller **super_admin** på platformen
2. Åbn browser konsollen (F12)
3. Kør denne kode:

```javascript
const { data: session } = await supabase.auth.getSession();
const response = await fetch(
  'https://xbdwcpmldtmqmavvfasb.supabase.co/functions/v1/sync-stripe-products',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
);
const result = await response.json();
console.log(result);
```

Denne funktion vil:
- Oprette alle produkter i Stripe
- Oprette månedlige og årlige priser
- Linke Stripe produkter med databasen

### Manuel Metode

Hvis du foretrækker at oprette produkterne manuelt:

1. Gå til [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Klik **Add product**

For hver pakke:

**Country Membership Basic:**
- Name: `Country Membership Basic`
- Description: `Adgang til dit landespecifikke gruppe`
- Pricing:
  - Recurring: Monthly - 39.00 DKK
  - Recurring: Yearly - 328.00 DKK
- Metadata:
  - `product_code`: `country_basic`
  - `product_type`: `country`
  - `product_tier`: `basic`

**Country Membership Plus:**
- Name: `Country Membership Plus`
- Description: `Fuld adgang til dit landespecifikke gruppe`
- Pricing:
  - Recurring: Monthly - 59.00 DKK
  - Recurring: Yearly - 496.00 DKK
- Metadata:
  - `product_code`: `country_plus`
  - `product_type`: `country`
  - `product_tier`: `plus`

**World Wide Membership Basic:**
- Name: `World Wide Membership Basic`
- Description: `Adgang til både lokale og verdensomspændende grupper`
- Pricing:
  - Recurring: Monthly - 49.00 DKK
  - Recurring: Yearly - 412.00 DKK
- Metadata:
  - `product_code`: `worldwide_basic`
  - `product_type`: `worldwide`
  - `product_tier`: `basic`

**World Wide Membership Plus:**
- Name: `World Wide Membership Plus`
- Description: `Fuld adgang til alle funktioner og grupper`
- Pricing:
  - Recurring: Monthly - 69.00 DKK
  - Recurring: Yearly - 580.00 DKK
- Metadata:
  - `product_code`: `worldwide_plus`
  - `product_type`: `worldwide`
  - `product_tier`: `plus`

**VIGTIGT:** Metadata felterne skal være præcis som vist ovenfor. De bruges til at matche Stripe produkter med databasen.

---

## Trin 6: Test Betalingen

### Test Mode

Stripe starter i test mode. Brug disse testkort:

**Succesfuld betaling:**
- Kortnummer: `4242 4242 4242 4242`
- Udløb: Enhver fremtidig dato
- CVC: Enhver 3 cifre
- Postnummer: Enhver 5 cifre

**Andre testscenarier:**
- Afvist kort: `4000 0000 0000 0002`
- Kræver 3D Secure: `4000 0027 6000 3184`

### Test Flowet

1. Gå til `/pricing` på din platform
2. Vælg en pakke
3. Klik "Vælg plan"
4. Udfyld checkout formularen
5. Brug et testkort
6. Gennemfør betalingen
7. Du bliver redirected til `/success`
8. Check at medlemskabet er aktiveret i databasen:

```sql
SELECT * FROM user_product_access WHERE is_active = true;
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
```

---

## Trin 7: Gå Live (Production)

Når du er klar til at tage rigtige betalinger:

1. Gennemfør Stripe's onboarding proces
2. Aktiver production mode i Stripe Dashboard
3. Hent production API keys (starter med `pk_live_` og `sk_live_`)
4. Opdater environment variables med production keys
5. Opdater webhook URL til production URL
6. Test igen med et rigtigt kort (lavt beløb)
7. Aktiver platformen for offentligheden

---

## Sådan Virker Det Teknisk

### Betalingsflow

```
1. Bruger vælger pakke på /pricing
     ↓
2. Bruger går til /checkout
     ↓
3. Frontend kalder create-checkout-session edge function
     ↓
4. Edge function opretter Stripe checkout session
     ↓
5. Bruger redirectes til Stripe's checkout side
     ↓
6. Bruger indtaster kortoplysninger
     ↓
7. Stripe behandler betaling
     ↓
8. Stripe sender webhook til stripe-webhook edge function
     ↓
9. Webhook opretter/opdaterer bruger i databasen
     ↓
10. Webhook aktiverer medlemskab i user_product_access
     ↓
11. Bruger redirectes til /success
```

### Edge Functions

Platformen har 3 Stripe edge functions:

1. **sync-stripe-products**
   - Synkroniserer produkter fra database til Stripe
   - Kun tilgængelig for admins
   - Køres én gang ved opsætning

2. **create-checkout-session**
   - Opretter Stripe checkout session
   - Håndterer gavekoder og rabatter
   - Returns checkout URL

3. **stripe-webhook**
   - Modtager events fra Stripe
   - Opretter bruger hvis ny
   - Aktiverer medlemskab
   - Registrerer betaling

### Database Tabeller

**products** - Medlemskabspakker
- Indeholder navn, pris, beskrivelse
- `stripe_product_id` linker til Stripe

**user_product_access** - Aktive medlemskaber
- Viser hvilke brugere har adgang til hvilke pakker
- `is_active`, `started_at`, `expires_at`

**payments** - Betalingshistorik
- Alle gennemførte betalinger
- `stripe_payment_intent_id`, `amount`, `status`

**gift_codes** - Gavekoder og rabatter
- Procentrabat, fast beløb eller gratis adgang
- Spores via `gift_code_usage`

---

## Fejlfinding

### "Stripe er ikke konfigureret endnu"
- Check at `VITE_STRIPE_PUBLISHABLE_KEY` er sat i `.env`
- Genstart development server efter ændring af `.env`

### "Produkt ikke synkroniseret med Stripe"
- Kør sync-stripe-products edge funktionen
- Check at produkter findes i Stripe Dashboard
- Verificer at metadata er korrekt sat

### "No stripe signature found"
- Check at webhook signing secret er sat korrekt i Supabase
- Verificer at webhook URL er korrekt i Stripe Dashboard

### Betaling gennemført men medlemskab ikke aktiveret
- Check webhook logs i Stripe Dashboard
- Se Supabase logs for stripe-webhook funktionen
- Verificer at email matcher mellem Stripe og Supabase

### Test kort virker ikke
- Sørg for at du er i test mode
- Check at kortnummer er korrekt: `4242 4242 4242 4242`
- Brug fremtidig dato for udløb

---

## Support

Hvis du har problemer:

1. Check Stripe Dashboard > Logs
2. Check Supabase > Edge Functions > Logs
3. Check browser konsol for fejl
4. Kontakt Stripe support: [support.stripe.com](https://support.stripe.com)

---

## Sikkerhed

**VIGTIGT:**

- ❌ Gem ALDRIG secret keys i frontend koden
- ❌ Commit ALDRIG `.env` til git
- ✅ Brug kun publishable key i frontend
- ✅ Håndter secret keys kun i edge functions
- ✅ Verificer webhook signatures
- ✅ Brug HTTPS i production

---

## Næste Skridt

Efter Stripe er sat op:

1. Test alle pakker og betalingsflows
2. Opsæt email notifikationer for betalinger
3. Konfigurer fakturering i Stripe Dashboard
4. Opsæt dunning for fejlede betalinger
5. Implementer kunde self-service portal

God fornøjelse med Stripe integration! 🚀
