import { useTranslation } from "react-i18next";

export default function MembershipPricingSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-20 bg-white flex flex-col items-center" id="membership">
      <div className="mb-8">
        <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full text-sm mb-3">
          {t("pricing.membershipLabel")}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          {t("pricing.plansTitle")}
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          {t("pricing.plansDesc")}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-5xl">
        {/* Country Basic */}
        <div className="flex-1 bg-gray-50 rounded-2xl shadow p-8 flex flex-col items-center border border-gray-200">
          <div className="font-bold text-lg mb-2">{t("pricing.countryBasic")}</div>
          <div className="text-3xl font-extrabold mb-2">$21 <span className="text-base font-medium">/year</span></div>
          <div className="text-gray-500 text-sm mb-4">{t("pricing.countryBasicDesc")}</div>
        </div>
        {/* Country Plus */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border-2 border-orange-400 p-8 flex flex-col items-center relative">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-400 text-white font-bold px-4 py-1 rounded-full text-xs shadow"> {t("pricing.mostPopular")} </span>
          <div className="font-bold text-lg mb-2">{t("pricing.countryPlus")}</div>
          <div className="text-3xl font-extrabold mb-2">$43 <span className="text-base font-medium">/year</span></div>
          <div className="text-gray-500 text-sm mb-4">{t("pricing.countryPlusDesc")}</div>
        </div>
        {/* World Wide Basic */}
        <div className="flex-1 bg-gray-50 rounded-2xl shadow p-8 flex flex-col items-center border border-gray-200">
          <div className="font-bold text-lg mb-2">{t("pricing.worldwideBasic")}</div>
          <div className="text-3xl font-extrabold mb-2">$32 <span className="text-base font-medium">/year</span></div>
          <div className="text-gray-500 text-sm mb-4">{t("pricing.worldwideBasicDesc")}</div>
        </div>
        {/* World Wide Plus */}
        <div className="flex-1 bg-gray-50 rounded-2xl shadow p-8 flex flex-col items-center border border-gray-200">
          <div className="font-bold text-lg mb-2">{t("pricing.worldwidePlus")}</div>
          <div className="text-3xl font-extrabold mb-2">$49 <span className="text-base font-medium">/year</span></div>
          <div className="text-gray-500 text-sm mb-4">{t("pricing.worldwidePlusDesc")}</div>
        </div>
      </div>
    </section>
  );
}
