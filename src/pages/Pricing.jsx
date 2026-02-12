import { Link } from 'react-router-dom';
import PackageComparison from '../components/PackageComparison';

export default function Pricing() {

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1157394/pexels-photo-1157394.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            height: '400px'
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
            </div>
          </div>
        </nav>

        <section className="relative z-10 max-w-7xl mx-auto px-8 pb-20">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Vælg dit medlemskab
            </h1>
            <p className="text-xl text-white mb-8 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
              Find den pakke der passer til dig og få adgang til dit adoptionsfællesskab
            </p>
          </div>
        </section>
      </div>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <PackageComparison />

        <div className="mt-12 bg-[#1A237E]/5 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-[#222222] mb-6 text-center">
            Ofte stillede spørgsmål
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[#222222] mb-2">Hvad er forskellen på Basic og Plus?</h3>
              <p className="text-gray-600 text-sm">
                Basic giver læseadgang og begrænset social interaktion. Plus giver fuld adgang til at oprette indhold, events og deltage i alle funktioner.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#222222] mb-2">Hvad betyder World Wide?</h3>
              <p className="text-gray-600 text-sm">
                World Wide pakker giver adgang til både dit lokale landegruppe OG den verdensomspændende gruppe for dit land, så du kan forbinde med mennesker over hele verden.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#222222] mb-2">Kan jeg skifte pakke senere?</h3>
              <p className="text-gray-600 text-sm">
                Ja, du kan til enhver tid opgradere til en højere pakke. Nedgradering træder i kraft ved næste fornyelse.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#222222] mb-2">Kan jeg vælge månedlig eller årlig betaling?</h3>
              <p className="text-gray-600 text-sm">
                Ja, du kan vælge mellem månedlig og årlig betaling. Med årlig betaling sparer du 30% sammenlignet med månedlig.
              </p>
            </div>
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
