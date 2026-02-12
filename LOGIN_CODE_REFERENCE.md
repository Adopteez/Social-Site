# 📂 Login Kode Reference Guide

## 🎯 Hurtig Oversigt

Her er alle de filer Commet skal kende til for at arbejde med login-systemet.

---

## 📁 Filer i Projektet

### 1. **Login UI Komponent**
📄 **Fil:** `src/pages/Landing.jsx`
📍 **Linjer:** 1-117
🎨 **Formål:** Selve login-siden med formularen

**Indeholder:**
- Login formular (email + password)
- Fejlhåndtering
- Loading state
- Link til registrering
- Adopteez branding (logo, farver)

**Vigtige funktioner:**
```javascript
const handleLogin = async (e) => {
  // Håndterer login submit
  await signIn(loginForm.email, loginForm.password);
  navigate('/home'); // Sender bruger til home efter login
}
```

---

### 2. **Authentication Context**
📄 **Fil:** `src/contexts/AuthContext.jsx`
📍 **Linjer:** 1-120
🔐 **Formål:** Håndterer al authentication logik

**Indeholder:**
- `signIn(email, password)` - Login funktion
- `signUp(email, password, fullName)` - Registrering
- `signOut()` - Log ud
- `user` state - Nuværende bruger
- `profile` state - Bruger profil fra database

**Vigtig funktion:**
```javascript
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};
```

---

### 3. **Supabase Connection**
📄 **Fil:** `src/lib/supabase.js`
🔌 **Formål:** Connection til Supabase database

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### 4. **Environment Variabler**
📄 **Fil:** `.env`
🔑 **Formål:** Credentials til Supabase

```env
VITE_SUPABASE_URL=https://slvnkjvnsydgurtnevsm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### 5. **Standalone Login HTML**
📄 **Fil:** `public/standalone-login.html`
🌐 **Formål:** Klar-til-brug login side til ekstern hjemmeside

**Features:**
- Ingen dependencies på React
- Komplet HTML + CSS + JavaScript
- Kan bruges direkte på enhver hjemmeside
- Inkluderer Supabase authentication

**Hvordan bruge:**
1. Download filen
2. Upload til din hjemmeside
3. Rediger `REDIRECT_URL` på linje 153
4. Åbn i browser: `https://dinhjemmeside.dk/standalone-login.html`

---

## 🔧 Sådan Redigeres Login

### Ændre Logo
📄 **Fil:** `src/pages/Landing.jsx`
📍 **Linje:** 48-52

```jsx
<img
  src="/Adopteez uB -Hvis tekst-Photoroom.png"
  alt="Adopteez Logo"
  className="h-24 mx-auto mb-6 drop-shadow-2xl"
/>
```

---

### Ændre Farver
📄 **Fil:** `tailwind.config.js` eller direkte i komponenter

**Nuværende farver:**
```javascript
colors: {
  'adopteez-primary': '#1A237E',    // Blå
  'adopteez-accent': '#FF6F00',     // Orange
  'adopteez-secondary': '#FFA040',  // Lys orange
}
```

---

### Ændre Redirect Efter Login
📄 **Fil:** `src/pages/Landing.jsx`
📍 **Linje:** 22

```javascript
navigate('/home'); // Ændr '/home' til ønsket destination
```

---

### Tilføj "Glemt adgangskode"

**Tilføj efter password input i `Landing.jsx`:**

```jsx
<div className="text-right mb-4">
  <a
    href="/reset-password"
    className="text-sm text-white hover:underline"
  >
    Glemt adgangskode?
  </a>
</div>
```

---

## 🚀 Integration på Ekstern Hjemmeside

### Metode 1: Direkte Link (Nemmest)
```html
<a href="https://jeres-app-url.com" class="login-btn">
  Log ind til Adopteez Social
</a>
```

### Metode 2: iFrame Embed
```html
<iframe
  src="https://jeres-app-url.com"
  width="500"
  height="600"
  frameborder="0"
></iframe>
```

### Metode 3: Standalone Form
```html
<!-- Upload standalone-login.html til din server -->
<a href="/standalone-login.html">Log ind</a>
```

---

## 📊 Hvordan Login Virker

```
1. Bruger indtaster email + password
   ↓
2. Landing.jsx's handleLogin() kaldes
   ↓
3. AuthContext's signIn() kaldes
   ↓
4. supabase.auth.signInWithPassword() kaldes
   ↓
5. Supabase verificerer credentials
   ↓
6. Ved success: User session oprettes
   ↓
7. navigate('/home') sender bruger til home page
   ↓
8. Layout.jsx tjekker om user er authenticated
   ↓
9. Home page vises
```

---

## 🔐 Sikkerhed

### Password Requirements
**Nuværende:** Ingen krav (Supabase standard)

**For at tilføje krav, opdater Supabase settings:**
1. Gå til Supabase Dashboard
2. Authentication → Settings
3. Password Requirements
4. Sæt minimum længde, kompleksitet osv.

### Email Confirmation
**Status:** DEAKTIVERET

**For at aktivere:**
1. Supabase Dashboard
2. Authentication → Settings
3. Enable "Confirm email"

---

## 🎨 Styling Reference

### Login Form Styling
📄 **Fil:** `src/pages/Landing.jsx`

**Baggrund:**
```jsx
className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50"
```

**Input fields:**
```jsx
className="w-full px-4 py-3 bg-white border border-white/30 rounded-lg focus:ring-2 focus:ring-[#FF6F00]"
```

**Login knap:**
```jsx
className="w-full bg-[#FF6F00] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#FFA040]"
```

---

## 📝 Testing Login

### Test Bruger
**Email:** `kimjelling7@gmail.com`
**Rolle:** super_admin

### Test Flow
```bash
1. Gå til https://jeres-app-url.com
2. Indtast test email + password
3. Klik "Log ind"
4. Verificer redirect til /home
5. Tjek at bruger er logget ind
6. Tjek at admin menu vises (for super_admin)
```

---

## 🆘 Fejlfinding

### Login virker ikke
✅ **Tjek:**
1. Er `.env` filen sat op korrekt?
2. Er Supabase URL og Anon Key korrekte?
3. Er email/password korrekt?
4. Er brugeren oprettet i databasen?
5. Er brugerens email bekræftet? (hvis enabled)

### Redirect virker ikke
✅ **Tjek:**
1. Er `navigate('/home')` kaldt efter login?
2. Er `/home` route defineret i `App.jsx`?
3. Er der fejl i browser console?

### Styling ser forkert ud
✅ **Tjek:**
1. Er Tailwind CSS loaded?
2. Er farver defineret i `tailwind.config.js`?
3. Er billeder/logo tilgængelige i `/public`?

---

## 📞 Kontakt

**Spørgsmål til koden?**
- Kig i denne guide først
- Tjek filerne listet ovenfor
- Test i browser med console åben
- Kontakt Kim Jelling hvis problemet fortsætter

**Pro tip:** Brug browser DevTools (F12) til at debugge login issues!
