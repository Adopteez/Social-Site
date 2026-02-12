import { useState } from 'react';
import { X, Lock, Key, Hash } from 'lucide-react';

export default function PartnerGroupAccessModal({ isOpen, onClose, onSubmit, group }) {
  const [accessValue, setAccessValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!accessValue.trim()) {
      if (group.access_type === 'code') {
        setError('Indtast venligst adgangskode');
      } else if (group.access_type === 'member_number') {
        setError('Indtast venligst medlemsnummer');
      }
      return;
    }

    onSubmit(accessValue);
  };

  const getTitle = () => {
    if (group.access_type === 'code') return 'Adgangskode påkrævet';
    if (group.access_type === 'member_number') return 'Medlemsnummer påkrævet';
    return 'Anmod om adgang';
  };

  const getPlaceholder = () => {
    if (group.access_type === 'code') return 'Indtast adgangskode...';
    if (group.access_type === 'member_number') return 'Indtast medlemsnummer...';
    return '';
  };

  const getIcon = () => {
    if (group.access_type === 'code') return <Key size={24} className="text-adopteez-primary" />;
    if (group.access_type === 'member_number') return <Hash size={24} className="text-adopteez-primary" />;
    return <Lock size={24} className="text-adopteez-primary" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              {group.access_type === 'code' && 'Denne gruppe kræver en adgangskode for at deltage.'}
              {group.access_type === 'member_number' && 'Denne gruppe kræver et medlemsnummer for at deltage.'}
              {group.access_type === 'approval' && 'Send en anmodning til gruppeadministratoren for at få adgang.'}
            </p>

            {group.access_type !== 'approval' && (
              <input
                type="text"
                value={accessValue}
                onChange={(e) => setAccessValue(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
                autoFocus
              />
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-accent transition-colors font-semibold"
            >
              {group.access_type === 'approval' ? 'Send anmodning' : 'Bekræft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
