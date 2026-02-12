# Stripe Quick Start Guide

Hurtig guide til at få Stripe betalinger til at virke på Adopteez.

## 1. Hent Stripe API Nøgler (5 min)

1. Opret konto på [stripe.com](https://stripe.com/dk)
2. Gå til **Developers > API keys**
3. Kopier **Publishable key** (starter med `pk_test_`)
4. Gem den i din `.env` fil:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_din_noegle_her
```

5. Genstart din development server

## 2. Opsæt Webhook (5 min)

1. Gå til **Developers > Webhooks**
2. Klik **Add endpoint**
3. URL: `https://xbdwcpmldtmqmavvfasb.supabase.co/functions/v1/stripe-webhook`
4. Vælg events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Klik **Add endpoint**
6. Secret'en er automatisk konfigureret i Supabase

## 3. Synkroniser Produkter (2 min)

Log ind som admin på platformen og kør denne kode i browser konsollen:

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

## 4. Test Betaling (3 min)

1. Gå til `/pricing` på din platform
2. Vælg en pakke
3. Testkort: `4242 4242 4242 4242`
4. Udløb: Enhver fremtidig dato (fx 12/25)
5. CVC: 123
6. Gennemfør betalingen

Færdig! Betalingen skulle nu virke.

## Produkter i Systemet

| Pakke | Månedlig | Årlig |
|-------|----------|-------|
| Country Basic | 39 DKK | 328 DKK |
| Country Plus | 59 DKK | 496 DKK |
| Worldwide Basic | 49 DKK | 412 DKK |
| Worldwide Plus | 69 DKK | 580 DKK |

## Fejlfinding

**Checkout virker ikke:**
- Check at `VITE_STRIPE_PUBLISHABLE_KEY` er sat
- Genstart development server

**"Produkt ikke synkroniseret":**
- Kør sync script (trin 3)
- Check at produkter vises i Stripe Dashboard

**Betaling gennemført men ingen adgang:**
- Check webhook er oprettet korrekt
- Se Supabase logs under Edge Functions

## Se Komplet Dokumentation

For detaljeret guide, se [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)
