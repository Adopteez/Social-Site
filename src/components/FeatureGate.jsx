import { useState, useEffect } from 'react';
import { useMembership } from '../hooks/useMembership';
import UpgradePrompt from './UpgradePrompt';

export default function FeatureGate({
  featureKey,
  featureName,
  requiredTier,
  children,
  fallback = null,
  showUpgradePrompt = true,
  inline = false,
}) {
  const { hasFeature, loading, membership } = useMembership();
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkAccess();
    }
  }, [featureKey, loading, membership]);

  async function checkAccess() {
    const access = await hasFeature(featureKey);
    setHasAccess(access);
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-full"></div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return fallback;
  }

  if (inline) {
    return (
      <UpgradePrompt
        featureName={featureName}
        requiredTier={requiredTier}
        inline={true}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Opgrader til {featureName}
      </button>

      {showUpgrade && (
        <UpgradePrompt
          featureName={featureName}
          requiredTier={requiredTier}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
