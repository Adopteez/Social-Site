import { Crown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UpgradePrompt({
  featureName,
  requiredTier,
  onClose,
  inline = false
}) {
  const { t } = useTranslation();

  const tierNames = {
    country_basic: 'Country Membership Basic',
    country_plus: 'Country Membership Plus',
    worldwide_basic: 'Worldwide Membership Basic',
    worldwide_plus: 'Worldwide Membership Plus',
  };

  const tierPrices = {
    country_basic: '$21',
    country_plus: '$43',
    worldwide_basic: '$32',
    worldwide_plus: '$49',
  };

  const upgradeUrl = '/pricing';

  if (inline) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="text-white" size={32} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('membership.upgradeRequired', 'Upgrade Required')}
        </h3>
        <p className="text-gray-700 mb-4">
          {t('membership.featureRequires', { feature: featureName, tier: tierNames[requiredTier] })}
        </p>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-2xl font-bold text-adopteez-primary mb-1">
            {tierPrices[requiredTier]}
            <span className="text-sm font-normal text-gray-600">/year</span>
          </p>
          <p className="text-sm text-gray-600">{tierNames[requiredTier]}</p>
        </div>
        <a
          href={upgradeUrl}
          className="inline-block w-full px-6 py-3 bg-gradient-to-r from-adopteez-primary to-adopteez-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          {t('membership.upgradeNow', 'Upgrade Now')}
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="text-white" size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {t('membership.upgradeRequired', 'Upgrade Required')}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {t('membership.featureRequiresDesc', {
            feature: featureName,
            defaultValue: `The feature "${featureName}" is only available for ${tierNames[requiredTier]} members and above.`
          })}
        </p>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 text-center border-2 border-amber-200">
          <p className="text-sm text-gray-600 mb-2">{t('membership.upgradeToTier', 'Upgrade to')}</p>
          <p className="text-xl font-bold text-gray-900 mb-1">{tierNames[requiredTier]}</p>
          <p className="text-3xl font-bold text-adopteez-primary">
            {tierPrices[requiredTier]}
            <span className="text-lg font-normal text-gray-600">/year</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <a
            href={upgradeUrl}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-adopteez-primary to-adopteez-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center"
          >
            {t('membership.upgradeNow', 'Upgrade Now')}
          </a>
        </div>
      </div>
    </div>
  );
}
