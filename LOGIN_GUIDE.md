# 🔐 Login Guide til Adopteez Social

## 📍 URL til Hjemmesiden

**Ny Adopteez Social hjemmeside:**
```
https://slvnkjvnsydgurtnevsm.supabase.co
```

eller via deployment URL hvis den er sat op på Vercel/Netlify.

---

## 👤 Login til Platformen

### For Commet (Administrator)

Du skal bruge din email og adgangskode for at logge ind.

**Hvis du ikke har en konto endnu:**

1. Gå til hjemmesiden
2. Klik på "Opret konto" eller "Tilmeld dig"
3. Udfyld formularen med:
   - **Email:** Din email
   - **Adgangskode:** Vælg en sikker adgangskode
   - **Fulde navn:** Commet (eller dit rigtige navn)
4. Klik "Opret konto"
5. Efter oprettelse, kontakt Kim Jelling for at få administratorrettigheder

**Hvis du allerede har en konto:**

1. Gå til hjemmesiden
2. Klik på "Log ind"
3. Indtast din **email** og **adgangskode**
4. Klik "Log ind"

---

## 🔧 Få Administratoradgang

Efter du har oprettet din konto, skal Kim Jelling give dig administratorrettigheder.

**Kim skal køre følgende SQL kommando i Supabase:**

```sql
-- Find Commet's profil ID
SELECT id, email, full_name FROM profiles WHERE email = 'commet@email.dk';

-- Opdater Commet til super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'commet@email.dk';
```

**Alternative roller:**
- `super_admin` - Fuld adgang til alle funktioner
- `admin` - Administrators adgang (men ikke fuld super admin)
- `moderator` - Kan moderere indhold og håndtere rapporter
- `group_admin` - Kan administrere specifikke grupper

---

## 🎯 Admin Dashboard

Efter login som administrator, kan du tilgå:

**Admin Dashboard URL:**
```
/admin
```

**Fra Admin Dashboard kan du:**
- 📊 Se statistikker over medlemmer og grupper
- 👥 Administrere medlemmer
- 🏘️ Administrere grupper og uploade gruppe-bannere
- 💰 Se betalinger og medlemskaber
- 📝 Administrere blog posts
- 🚨 Håndtere rapporter og feedback
- ⚠️ Administrere advarsler og eksklusioner

---

## 🖼️ Upload Gruppe-Bannere

1. Gå til **Admin Dashboard** → **Grupper**
2. Find den gruppe du vil uploade et banner til
3. Klik på **billedikon** 🖼️ ved siden af "Se detaljer"
4. Upload et billede (PNG, JPG, WEBP eller GIF - maks 5MB)
5. Klik "Upload Banner"

**Status:**
- 189 grupper oprettet
- 18 grupper har bannere
- 171 grupper mangler bannere

---

## 📊 Nuværende Database Status

### ✅ Data i Databasen:
- **189 grupper** (country og worldwide groups)
- **10 posts**
- **4 analytics events** (aktivitetslog)
- **3 feedback tickets**
- **1 blog post**
- **3 familiehistorier**
- **2 børn**
- **1 profil** (Kim Jelling - super_admin)
- **4 produkter** (medlemskabspakker)

### 📸 Uploadede Filer:
- **6 billeder** (2.93 MB total)
  - 2 børnebilleder
  - 1 familiehistorie billede
  - 1 profilbillede
  - 2 post-billeder

### 💾 Storage Buckets:
- `profile-images` - Profilbilleder
- `profiles` - Profil banners og post billeder
- `children` - Børnebilleder
- `group-banners` - Gruppe bannere (ny!)

---

## 🆘 Support

Hvis du har problemer med at logge ind eller få adgang:

**Kontakt:**
- **Kim Jelling Ørnbo**
- Email: kimjelling7@gmail.com
- Rolle: Super Administrator

**Eller check:**
- Supabase Dashboard: https://slvnkjvnsydgurtnevsm.supabase.co

---

## 🔒 Sikkerhed

**Vigtige sikkerhedspunkter:**
- Del ALDRIG din adgangskode
- Brug en stærk, unik adgangskode
- Log ud når du er færdig
- Behandl brugerdata med respekt (GDPR)

---

## 📝 Notater

**Email confirmation er DEAKTIVERET** - Brugere kan logge ind med det samme efter oprettelse.

**Standard rolle for nye brugere:** `user`

For at ændre rolle til administrator, skal en super_admin køre SQL kommandoen vist ovenfor.
