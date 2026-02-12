# 🔐 Login Integration Guide til Ekstern Hjemmeside

## 📍 Hvor Ligger Login-Koden?

Login-systemet består af tre hovedkomponenter:

### 1. Login UI Komponent
**Fil:** `src/pages/Landing.jsx` (linje 1-117)

Dette er selve login-boksen med:
- Email og password felter
- Login knap
- Fejlhåndtering
- Link til registrering

### 2. Authentication Logic
**Fil:** `src/contexts/AuthContext.jsx` (linje 86-99)

`signIn` funktionen håndterer login:
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

### 3. Supabase Connection
**Fil:** `src/lib/supabase.js`

Connection til databasen med credentials fra `.env`

---

## 🚀 Integration på Ekstern Hjemmeside (Simple Løsning)

### Option 1: iFrame Embed (Nemmeste)

Tilføj dette til din hjemmeside hvor du vil have login-boksen:

```html
<iframe
  src="https://jeres-adopteez-app.com"
  width="500"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

**Fordele:**
- Super simpelt
- Ingen kode at vedligeholde
- Opdateres automatisk

**Ulemper:**
- Mindre fleksibelt design
- Cross-domain issues muligt

---

### Option 2: Redirect Link (Anbefaldet)

Tilføj en "Log ind" knap på din hjemmeside der sender brugere til Adopteez Social:

```html
<a
  href="https://jeres-adopteez-app.com"
  class="login-button"
  style="
    background-color: #FF6F00;
    color: white;
    padding: 16px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    transition: background-color 0.3s;
  "
  onmouseover="this.style.backgroundColor='#FFA040'"
  onmouseout="this.style.backgroundColor='#FF6F00'"
>
  Log ind til Adopteez Social
</a>
```

**Fordele:**
- Simpelt og sikkert
- Ingen vedligeholdelse
- Professionelt

---

### Option 3: Standalone Login Form (Avanceret)

Opret en fil: `standalone-login.html`

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adopteez Social Login</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1A237E 0%, #FF6F00 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 400px;
      width: 100%;
    }

    .logo {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo img {
      height: 80px;
      margin-bottom: 16px;
    }

    h1 {
      color: #1A237E;
      font-size: 28px;
      margin-bottom: 8px;
      text-align: center;
    }

    p {
      color: #666;
      text-align: center;
      margin-bottom: 32px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E0E0E0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #FF6F00;
    }

    button {
      width: 100%;
      background: #FF6F00;
      color: white;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
      background: #FFA040;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error {
      background: #FFEBEE;
      color: #C62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .success {
      background: #E8F5E9;
      color: #2E7D32;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .signup-link {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #E0E0E0;
    }

    .signup-link a {
      color: #1A237E;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <img src="/Adopteez uB -Hvis tekst-Photoroom.png" alt="Adopteez Logo">
      <h1>Adopteez Social</h1>
      <p>Fællesskab for adopterede og adoptivfamilier</p>
    </div>

    <div id="message"></div>

    <form id="loginForm">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="din@email.dk"
        >
      </div>

      <div class="form-group">
        <label for="password">Adgangskode</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          placeholder="••••••••"
        >
      </div>

      <button type="submit" id="loginBtn">
        Log ind
      </button>
    </form>

    <div class="signup-link">
      <p>Har du ikke en konto? <a href="https://adopteez.com">Tilmeld dig her</a></p>
    </div>
  </div>

  <script>
    // VIGTIG: Udskift med jeres egne Supabase credentials
    const SUPABASE_URL = 'https://slvnkjvnsydgurtnevsm.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdm5ranZuc3lkZ3VydG5ldnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzE1MTYsImV4cCI6MjA3NTQ0NzUxNn0.ExNpfjI2TNcTvkzCl2g2LugRoh8Ish2I-NZpvzCeca8';

    // URL til hvor brugeren skal sendes efter login
    const REDIRECT_URL = 'https://jeres-adopteez-app.com/home';

    // Initialiser Supabase
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const loginBtn = document.getElementById('loginBtn');

    function showMessage(message, type = 'error') {
      messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
    }

    function clearMessage() {
      messageDiv.innerHTML = '';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      loginBtn.disabled = true;
      loginBtn.textContent = 'Logger ind...';

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        showMessage('Login succesfuldt! Omdirigerer...', 'success');

        // Vent 1 sekund og omdiriger
        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 1000);

      } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Kunne ikke logge ind. Tjek dine loginoplysninger.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log ind';
      }
    });

    // Tjek om brugeren allerede er logget ind
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        showMessage('Du er allerede logget ind. Omdirigerer...', 'success');
        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 1000);
      }
    });
  </script>
</body>
</html>
```

---

## 📋 Hvad Skal Commet Gøre?

### Trin 1: Vælg Integration Metode

**For simpel løsning (anbefalet):**
- Brug Option 2 (Redirect Link)
- Tilføj en "Log ind" knap der peger på jeres Adopteez Social app

**For avanceret integration:**
- Brug Option 3 (Standalone Form)
- Upload `standalone-login.html` til din hjemmeside
- Rediger `REDIRECT_URL` til at passe med jeres app URL

### Trin 2: Tilføj på Hjemmesiden

**Hvis Commet bruger WordPress:**
```
1. Gå til Pages/Sider
2. Rediger den side hvor login skal være
3. Tilføj en "HTML" block
4. Indsæt login-koden (Option 2 eller 3)
5. Gem og publiser
```

**Hvis Commet bruger custom HTML:**
```
1. Åbn hjemmesidens HTML fil
2. Find stedet hvor login skal være
3. Indsæt login-koden
4. Upload til server
```

### Trin 3: Test Login

1. Gå til hjemmesiden
2. Klik på login-knappen
3. Log ind med test-bruger
4. Verificer at du omdirigeres til Adopteez Social

---

## 🔑 Vigtige URLs og Credentials

**App URL:** Skal sættes efter deployment (fx `https://adopteez-social.vercel.app`)

**Supabase URL:**
```
https://slvnkjvnsydgurtnevsm.supabase.co
```

**Supabase Anon Key:** (Se `.env` filen)

**Test bruger:**
- Email: `kimjelling7@gmail.com`
- Rolle: super_admin

---

## ⚠️ Sikkerhed

**ALDRIG del følgende:**
- Service Role Key (kun server-side)
- Database password
- Bruger passwords

**Supabase Anon Key er OK at dele** - den er designet til at være public i frontend kode.

---

## 🎨 Styling

Login-boksen bruger Adopteez farver:
- **Primær blå:** `#1A237E`
- **Primær orange:** `#FF6F00`
- **Sekundær orange:** `#FFA040`

Du kan tilpasse styling efter behov i CSS sektionen.

---

## 📞 Support til Commet

Hvis du har spørgsmål:

1. Kig i denne guide
2. Tjek `src/pages/Landing.jsx` for login UI
3. Tjek `src/contexts/AuthContext.jsx` for login logik
4. Kontakt Kim Jelling for hjælp

**Pro tip:** Den nemmeste løsning er Option 2 - bare tilføj en knap der linker til jeres Adopteez Social app!
