import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, onSubmit, type, targetName }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason);
      setReason('');
    }
  };

  if (!isOpen) return null;

  const title = type === 'post' ? 'Anmeld opslag' : 'Anmeld medlem';
  const description = type === 'post'
    ? 'Beskriv hvorfor dette opslag er upassende'
    : `Beskriv hvorfor ${targetName} ikke er passende for denne gruppe`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {description}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="6"
              placeholder="Skriv din begrundelse her..."
              required
            />
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-semibold mb-1">Vigtig information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Din anmeldelse vil blive behandlet af gruppe administratorer</li>
              <li>Falske anmeldelser kan resultere i konsekvenser</li>
              <li>Alle anmeldelser er fortrolige</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send anmeldelse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
