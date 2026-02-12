import { Link } from 'react-router-dom';
import { Heart, Users, Globe, Shield, Target, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/FAmilyCauch-Photoroom.jpg)',
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

        <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
          <div className="text-center">
            <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Om Adopteez
            </h1>
            <p className="text-2xl text-white drop-shadow-lg max-w-2xl mx-auto">
              En platform skabt af hjertet - for at forbinde adoptivfamilier på tværs af hele verden
            </p>
          </div>
        </section>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-t-3xl -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Family together"
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Historien bag Adopteez</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Adopteez.com blev skabt ud fra en personlig erfaring og et dybt ønske om at skabe en
                platform, hvor adoptivfamilier kunne mødes, dele historier og støtte hinanden.
              </p>
              <p>
                Som adoptivfar opdagede jeg, hvor svært det kan være at finde andre familier der
                forstår de unikke udfordringer og glæder, som adoption medfører. Der manglede et
                sted, hvor vi kunne forbinde på tværs af grænser og kulturer.
              </p>
              <p>
                I 2025 blev drømmen til virkelighed. Adopteez.com er nu en global platform, der
                forbinder adopterede, adoptivforældre og familier fra 28 adoptionslande og 15+
                bopælslande.
              </p>
              <p className="font-semibold text-adopteez-primary">
                Vores mission er enkel: At skabe et trygt rum hvor alle adoptivfamilier kan finde
                deres fællesskab og støtte.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Vores værdier</h2>
            <p className="text-xl text-gray-600">Det vi tror på og arbejder efter hver dag</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Empati & Forståelse</h3>
                <p className="text-sm text-gray-600">Vi forstår adoptionsrejsen fordi vi selv er en del af fællesskabet</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Sikkerhed & Privatliv</h3>
                <p className="text-sm text-gray-600">Dine data og dit privatliv er helligt</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Global Inklusion</h3>
                <p className="text-sm text-gray-600">Vi forbinder familier på tværs af kulturer og kontinenter</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Fællesskab</h3>
                <p className="text-sm text-gray-600">Sammen er vi stærkere og skaber rum for alle</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Målrettet Støtte</h3>
                <p className="text-sm text-gray-600">Vi matcher dig med de rigtige grupper og mennesker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Kontinuerlig Forbedring</h3>
                <p className="text-sm text-gray-600">Vi udvikler konstant nye funktioner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-adopteez-primary to-adopteez-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Vores mission</h2>
            <p className="text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              At skabe verdens største og mest støttende fællesskab for adoptivfamilier - et sted
              hvor ingen føler sig alene på deres rejse.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed">
                Vi tror på, at hver adoptivfamilie fortjener adgang til et fællesskab der forstår
                dem. Gennem Adopteez.com bygger vi broer mellem kulturer, generationer og kontinenter,
                og skaber livslange venskaber og støttenetværk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Klar til at blive en del af fællesskabet?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Tilmeld dig i dag og opdag styrken i at være en del af noget større
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-10 py-4 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-semibold text-lg"
            >
              Opret gratis konto
            </Link>
            <Link
              to="/pricing"
              className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-adopteez-primary hover:text-adopteez-primary transition-colors font-semibold text-lg"
            >
              Se priser
            </Link>
          </div>
        </div>
      </section>

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
