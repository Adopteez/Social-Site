import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isInStandaloneMode) {
      return;
    }

    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    if (hasSeenPrompt) {
      return;
    }

    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleShowIOSInstructions = () => {
    setShowIOSInstructions(true);
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border-2 border-[#1A237E] z-50 animate-slide-up">
        <div className="p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 bg-[#1A237E] rounded-xl flex items-center justify-center">
              <img src="/image.png" alt="Adopteez" className="w-12 h-12 rounded-lg" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1A237E] mb-1">
                Installer Adopteez
              </h3>
              <p className="text-sm text-gray-600">
                Få hurtigere adgang og bedre oplevelse
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF6F00]" />
              <span>Fungerer offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#FF6F00]" />
              <span>Installeres på din telefon</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF6F00]" />
              <span>Åbnes som en rigtig app</span>
            </div>
          </div>

          {isIOS ? (
            <button
              onClick={handleShowIOSInstructions}
              className="w-full bg-[#FF6F00] hover:bg-[#E65100] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Se hvordan
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full bg-[#FF6F00] hover:bg-[#E65100] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Installer nu
            </button>
          )}
        </div>
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-[#1A237E]">
                Installer på iOS
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#1A237E] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Tryk på Del-knappen</p>
                  <p className="text-gray-600">
                    Tryk på del-ikonet nederst i Safari browseren
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#1A237E] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Vælg "Føj til hjemmeskærm"</p>
                  <p className="text-gray-600">
                    Scroll ned og vælg "Føj til hjemmeskærm"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#1A237E] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Tryk på "Tilføj"</p>
                  <p className="text-gray-600">
                    Bekræft ved at trykke "Tilføj" øverst til højre
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              className="w-full mt-6 bg-[#FF6F00] hover:bg-[#E65100] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Forstået
            </button>
          </div>
        </div>
      )}
    </>
  );
}
