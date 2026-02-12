import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1157394/pexels-photo-1157394.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            height: '700px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50"></div>
        </div>

        <nav className="relative z-10 bg-transparent">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-center h-24">
              <div className="hidden lg:flex items-center" style={{ gap: '10px' }}>
                <Link to="/" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Hjem
                </Link>
                <Link to="/groups" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Grupper
                </Link>
                <Link to="/blog" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Blog
                </Link>
                <Link to="/pricing" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Priser
                </Link>
                <Link to="/about" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Om os
                </Link>
                <Link to="/contact" className="text-white hover:text-[#FF6F00] font-bold text-4xl transition-colors drop-shadow-lg">
                  Kontakt
                </Link>
              </div>

              <div className="absolute right-8">
                <Link
                  to="/"
                  className="text-white hover:text-[#FF6F00] font-bold text-lg transition-colors drop-shadow-lg"
                >
                  Log ind
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-8 py-12">
          <div className="w-full max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                Kontakt os
              </h1>
              <p className="text-2xl text-white drop-shadow-lg max-w-2xl mx-auto">
                Har du spørgsmål eller brug for hjælp? Vi er her for at hjælpe dig
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">Send os en besked</h2>
              {success && (
                <div className="mb-6 p-4 bg-green-500/90 backdrop-blur-sm rounded-lg text-white font-semibold">
                  Tak for din besked! Vi vender tilbage hurtigst muligt.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-white mb-2 drop-shadow-lg">Navn</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2 drop-shadow-lg">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2 drop-shadow-lg">Emne</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2 drop-shadow-lg">Besked</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] text-gray-900"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#FF6F00] hover:bg-[#FFA040] text-white rounded-lg transition-colors font-bold text-lg shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Sender...' : 'Send besked'}
                </button>
              </form>
                </div>
              </div>

              <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6F00] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Mail className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">E-mail</h3>
                <p className="text-white text-base mb-2 drop-shadow-lg">Send os en e-mail og vi svarer inden for 24 timer</p>
                <a href="mailto:kontakt@adopteez.com" className="text-[#FF6F00] bg-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#FFA040] hover:text-white transition-colors inline-block shadow-lg">
                  kontakt@adopteez.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6F00] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Telefon</h3>
                <p className="text-white text-base mb-2 drop-shadow-lg">Ring til os mandag-fredag 9-17</p>
                <a href="tel:+4512345678" className="text-[#FF6F00] bg-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#FFA040] hover:text-white transition-colors inline-block shadow-lg">
                  +45 12 34 56 78
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6F00] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Adresse</h3>
                <p className="text-white text-base drop-shadow-lg">
                  Adopteez ApS<br />
                  Nørregade 1<br />
                  1165 København K<br />
                  Danmark
                </p>
              </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Adopteez.com. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
