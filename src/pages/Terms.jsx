import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Brugervilkår</h1>
        <p className="text-gray-600 mb-12">Sidst opdateret: Januar 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Accept af vilkår</h2>
            <p className="text-gray-700 leading-relaxed">
              Ved at oprette en konto og bruge Adopteez.com accepterer du disse brugervilkår. Hvis du ikke
              accepterer vilkårene, må du ikke bruge platformen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Beskrivelse af tjenesten</h2>
            <p className="text-gray-700 leading-relaxed">
              Adopteez.com er en social platform der forbinder adoptivfamilier verden over. Platformen giver
              adgang til grupper, beskeder, events og andre sociale funktioner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Brugerkonti</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Du er ansvarlig for at holde dit login sikkert</li>
              <li>Du skal give korrekte oplysninger ved oprettelse</li>
              <li>Du må ikke dele din konto med andre</li>
              <li>Du skal være mindst 13 år for at oprette en konto</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Adfærdsregler</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Du accepterer at:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Behandle andre medlemmer med respekt</li>
              <li>Ikke dele krænkende, hadefuldt eller ulovligt indhold</li>
              <li>Ikke udgive dig for at være andre personer</li>
              <li>Ikke spamme eller sende uønsket reklame</li>
              <li>Respektere andre medlemmers privatliv</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Indhold</h2>
            <p className="text-gray-700 leading-relaxed">
              Du beholder alle rettigheder til det indhold du deler. Ved at uploade indhold giver du Adopteez.com
              licens til at vise og distribuere indholdet på platformen. Vi kan fjerne indhold der bryder med
              disse vilkår.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Betaling og abonnementer</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Betalinger håndteres sikkert via Stripe</li>
              <li>Abonnementer fornyes automatisk</li>
              <li>Du kan opsige når som helst</li>
              <li>Refusion gives efter vores refusionspolitik</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Opsigelse</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi forbeholder os retten til at suspendere eller lukke konti der bryder med disse vilkår.
              Du kan selv lukke din konto når som helst fra indstillinger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Ansvarsfraskrivelse</h2>
            <p className="text-gray-700 leading-relaxed">
              Adopteez.com leveres "som den er". Vi garanterer ikke at tjenesten altid vil være tilgængelig
              eller fejlfri. Vi er ikke ansvarlige for indhold delt af brugere.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Ændringer til vilkår</h2>
            <p className="text-gray-700 leading-relaxed">
              Vi kan opdatere disse vilkår. Væsentlige ændringer vil blive kommunikeret via e-mail eller
              platform notifikationer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Kontakt</h2>
            <p className="text-gray-700 leading-relaxed">
              Har du spørgsmål til vilkårene? Kontakt os på{' '}
              <a href="mailto:kontakt@adopteez.com" className="text-adopteez-primary hover:underline">
                kontakt@adopteez.com
              </a>
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
