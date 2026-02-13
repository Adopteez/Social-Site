import { useTranslation } from "react-i18next";

export default function AdoptionCountriesSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-16 bg-[#f9fafb] flex flex-col items-center" id="countries">
      <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full text-sm mb-3">
        {t("countriesSection.globalNetwork")}
      </span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4">
        {t("countriesSection.title")}
      </h2>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
        {t("countriesSection.description")}
      </p>
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
        {/* Eksempel på lande - kan udvides */}
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Colombia</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Madagaskar</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Sydafrika</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Filippinerne</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Indien</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Taiwan</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Vietnam</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Kina</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Rumænien</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Danmark</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">USA</span>
        <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700 font-medium shadow text-sm">Verdensomspændende</span>
      </div>
    </section>
  );
}
