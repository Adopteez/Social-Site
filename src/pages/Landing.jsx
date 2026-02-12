import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from '../components/LanguageSelector';

export default function Landing() {
  const { t } = useTranslation();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(loginForm.email, loginForm.password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Kunne ikke logge ind. Tjek dine loginoplysninger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/FAmilyCauch-Photoroom.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <img
            src="/Adopteez uB -Hvis tekst-Photoroom.png"
            alt="Adopteez Logo"
            className="h-24 mx-auto mb-6 drop-shadow-2xl"
          />
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Adopteez Social</h1>
          <p className="text-white/90 text-lg drop-shadow-lg">{t('app.tagline')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-lg">{t('auth.login')}</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100/90 backdrop-blur-sm border border-red-300 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2 drop-shadow">{t('auth.email')}</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-white/30 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2 drop-shadow">{t('auth.password')}</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-white/30 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6F00] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#FFA040] transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? t('auth.signingIn') : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20 text-center">
            <p className="text-white mb-3 drop-shadow">{t('auth.dontHaveAccount')}</p>
            <a
              href="https://adopteez.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1A237E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#283593] transition-colors shadow-lg"
            >
              Gå til Adopteez.com
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-white/80 text-sm">
          <p>© 2024 Adopteez. Alle rettigheder forbeholdes.</p>
        </div>
      </div>
    </div>
  );
}
