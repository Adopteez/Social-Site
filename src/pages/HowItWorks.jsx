import { Link } from 'react-router-dom';
import { Heart, UserPlus, Users, MessageCircle, Calendar, Shield, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-adopteez-light">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">Adopteez.com</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-adopteez-primary transition-colors">Forside</Link>
              <Link to="/about" className="text-gray-600 hover:text-adopteez-primary transition-colors">Om os</Link>
              <Link to="/how-it-works" className="text-adopteez-primary font-medium">Sådan fungerer det</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-adopteez-primary transition-colors">Priser</Link>
              <Link to="/contact" className="text-gray-600 hover:text-adopteez-primary transition-colors">Kontakt</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-adopteez-primary transition-colors font-medium">
                Log ind
              </Link>
              <Link to="/signup" className="px-6 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-medium">
                Kom i gang
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Sådan fungerer Adopteez</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fire enkle trin til at finde dit fællesskab og forbinde med andre adoptivfamilier
          </p>
        </div>

        <div className="space-y-20 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <UserPlus size={32} />
                </div>
                <div className="text-6xl font-bold mb-2">01</div>
                <h2 className="text-3xl font-bold mb-4">Opret din profil</h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Tilmeld dig gratis på få minutter. Indtast dine oplysninger, fortæl din historie, og
                  vælg hvilke grupper der passer til din familie. Du bestemmer selv, hvad du vil dele.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>100% gratis at oprette konto</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Beskyttet med avanceret kryptering</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Du kontrollerer dit privatliv</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.pexels.com/photos/5905857/pexels-photo-5905857.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Create profile"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Find groups"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Users size={32} />
                </div>
                <div className="text-6xl font-bold mb-2">02</div>
                <h2 className="text-3xl font-bold mb-4">Find dine grupper</h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Vælg mellem 168+ specialiserede grupper baseret på adoptionsland, bopæl og om du er
                  adopteret eller adoptivforælder. Tilmeld dig så mange grupper du vil.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>28 adoptionslande dækket</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>15+ bopælslande inkluderet</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>World Wide grupper for hvert land</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle size={32} />
                </div>
                <div className="text-6xl font-bold mb-2">03</div>
                <h2 className="text-3xl font-bold mb-4">Forbind & kommuniker</h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Deltag i gruppediskussioner, send private beskeder, og byg meningsfulde relationer
                  med andre familier. Del dine erfaringer og lær af andre.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Private og sikre beskeder</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Gruppediskussioner og debatter</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Del billeder og historier</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Connect and communicate"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/1054713/pexels-photo-1054713.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Join events"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-8">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Calendar size={32} />
                </div>
                <div className="text-6xl font-bold mb-2">04</div>
                <h2 className="text-3xl font-bold mb-4">Deltag i events</h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Mød andre familier ansigt til ansigt ved lokale og internationale arrangementer.
                  Fra webinarer til sociale sammenkomster - der er noget for alle.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Lokale møder og arrangementer</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Online webinarer og workshops</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle size={20} className="mt-1 flex-shrink-0" />
                    <span>Internationale konferencer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fordele ved medlemskab</h2>
            <p className="text-xl text-gray-600">Hvad får du adgang til som medlem?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ubegrænset gruppeadgang</h3>
              <p className="text-gray-600">Tilmeld dig så mange grupper du vil - ingen begrænsninger</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Private beskeder</h3>
              <p className="text-gray-600">Chat sikkert med andre medlemmer i krypterede samtaler</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Event kalender</h3>
              <p className="text-gray-600">Se og tilmeld dig alle kommende arrangementer</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fuld privatkontrol</h3>
              <p className="text-gray-600">Du bestemmer hvad du deler og hvem der kan se det</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Profil & historier</h3>
              <p className="text-gray-600">Del din families historie og lær andre at kende</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-adopteez-primary rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium support</h3>
              <p className="text-gray-600">Få hjælp når du har brug for det fra vores team</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-adopteez-primary to-adopteez-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ofte stillede spørgsmål</h2>
          <div className="space-y-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Er det gratis at oprette en konto?</h3>
              <p className="text-white/90 leading-relaxed">
                Ja, det er 100% gratis at oprette en konto på Adopteez. Du får adgang til grundlæggende
                funktioner med det samme. For fuld adgang til alle grupper og funktioner kræves et medlemskab.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Hvor sikker er platformen?</h3>
              <p className="text-white/90 leading-relaxed">
                Sikkerhed er vores højeste prioritet. Vi bruger avanceret kryptering, Row Level Security (RLS)
                i vores database, og følger alle GDPR regler. Dine data er beskyttet med samme
                sikkerhedsniveau som banker bruger.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Kan jeg opsige mit medlemskab?</h3>
              <p className="text-white/90 leading-relaxed">
                Ja, du kan til enhver tid opsige dit medlemskab. Ingen binding, ingen skjulte gebyrer.
                Din data bevares, så du kan genaktivere når som helst.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Hvilke grupper kan jeg tilmelde mig?</h3>
              <p className="text-white/90 leading-relaxed">
                Du kan tilmelde dig grupper baseret på adoptionsland, bopælsland, og om du er adopteret
                eller adoptivforælder. Vi har 168+ grupper dækkende 28 adoptionslande og 15+ bopælslande.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Klar til at komme i gang?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Det tager kun 2 minutter at oprette din konto og finde dit fællesskab
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
