import { useTranslation } from "react-i18next";

export default function CallToActionSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full py-16 bg-gradient-to-r from-[#2563eb]/90 to-[#f97316]/90 flex flex-col items-center text-white" id="cta">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
        {t("cta.title")}
      </h2>
      <p className="text-lg text-center mb-8 max-w-2xl">
        {t("cta.description")}
      </p>
      <a
        href="#membership"
        className="bg-white text-[#f97316] font-bold px-10 py-4 rounded-full text-xl shadow hover:bg-orange-100 transition-colors duration-200"
      >
        {t("cta.button")}
      </a>
    </section>
  );
}
