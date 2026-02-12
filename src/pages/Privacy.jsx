import { Link } from 'react-router-dom';
import { Heart, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">Adopteez.com</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-adopteez-primary transition-colors">Tilbage til forside</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-2xl flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Privatlivspolitik</h1>
            <p className="text-gray-600 mt-2">Sidst opdateret: Januar 2025</p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduktion</h2>
            <p className="text-gray-700 leading-relaxed">
              Hos Adopteez.com tager vi dit privatliv meget alvorligt. Denne privatlivspolitik forklarer
              hvordan vi indsamler, bruger og beskytter dine personlige oplysninger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data vi indsamler</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Profiloplysninger</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Navn og e-mail adresse</li>
                  <li>Land og bopæl</li>
                  <li>Adoptionsland og medlemstype</li>
                  <li>Profilbillede (valgfrit)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Brugsdata</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Beskeder og indhold du deler</li>
                  <li>Grupper du er medlem af</li>
                  <li>Events du tilmelder dig</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tekniske data</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>IP-adresse</li>
                  <li>Browser type og version</li>
                  <li>Login tidspunkter</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hvordan vi bruger dine data</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>At levere og forbedre vores tjenester</li>
              <li>At matche dig med relevante grupper</li>
              <li>At kommunikere vigtige opdateringer</li>
              <li>At forhindre misbrug og sikre platform sikkerhed</li>
              <li>At overholde juridiske forpligtelser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Datadeling</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi deler ALDRIG dine personlige oplysninger med tredjeparter til marketingformål.
              Data deles kun i følgende tilfælde:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Med andre medlemmer i grupper du er en del af (kun hvad du vælger at dele)</li>
              <li>Med vores tekniske leverandører (Supabase, Stripe) som hjælper med at drive platformen</li>
              <li>Når det er lovpligtigt</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Datasikkerhed</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vi bruger avancerede sikkerhedsforanstaltninger for at beskytte dine data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>SSL/TLS kryptering for al datatransmission</li>
              <li>Row Level Security (RLS) i vores database</li>
              <li>Krypterede adgangskoder med bcrypt</li>
              <li>Regelmæssige sikkerhedsaudits</li>
              <li>To-faktor autentificering (2FA) tilgængelig</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Dine rettigheder (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under GDPR har du følgende rettigheder:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Ret til adgang:</strong> Du kan anmode om en kopi af dine data</li>
              <li><strong>Ret til rettelse:</strong> Du kan opdatere ukorrekte oplysninger</li>
              <li><strong>Ret til sletning:</strong> Du kan anmode om at slette din konto og data</li>
              <li><strong>Ret til dataportabilitet:</strong> Du kan få dine data i et læsbart format</li>
              <li><strong>Ret til at trække samtykke tilbage:</strong> Du kan til enhver tid ændre dine præferencer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi bruger nødvendige cookies for at platformen kan fungere (f.eks. login session).
              Vi bruger IKKE tracking cookies eller marketing cookies. Du kan til enhver tid slette
              cookies i din browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Børns privatliv</h2>
            <p className="text-gray-700 leading-relaxed">
              Adopteez.com er for brugere over 13 år. Hvis du er under 18 år, skal du have forældrenes
              samtykke for at bruge platformen. Vi indsamler ikke bevidst data fra børn under 13 år.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dataopbevaring</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi opbevarer dine data så længe din konto er aktiv. Hvis du sletter din konto,
              slettes dine personlige oplysninger inden for 30 dage. Visse data kan opbevares
              længere af juridiske årsager.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Internationale overførsler</h2>
            <p className="text-gray-700 leading-relaxed">
              Dine data opbevares på servere i EU (via Supabase). Vi overfører ikke data uden for EU
              uden passende beskyttelse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Ændringer til denne politik</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi kan opdatere denne privatlivspolitik. Væsentlige ændringer vil blive kommunikeret via
              e-mail eller platform notifikationer mindst 30 dage før de træder i kraft.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Kontakt databeskyttelse</h2>
            <p className="text-gray-700 leading-relaxed">
              Har du spørgsmål om dine data eller denne privatlivspolitik? Kontakt vores databeskyttelsesansvarlige:
            </p>
            <div className="bg-adopteez-light border-l-4 border-adopteez-primary p-6 mt-4 rounded-r-lg">
              <p className="text-gray-800">
                <strong>E-mail:</strong>{' '}
                <a href="mailto:privacy@adopteez.com" className="text-adopteez-primary hover:underline">
                  privacy@adopteez.com
                </a>
              </p>
              <p className="text-gray-800 mt-2">
                <strong>Adresse:</strong> Adopteez ApS, Nørregade 1, 1165 København K, Danmark
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Tilsynsmyndighed</h2>
            <p className="text-gray-700 leading-relaxed">
              Hvis du mener at vi ikke overholder GDPR, kan du klage til Datatilsynet i Danmark.
            </p>
          </section>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 Adopteez.com. Alle rettigheder forbeholdes.</p>
        </div>
      </footer>
    </div>
  );
}
