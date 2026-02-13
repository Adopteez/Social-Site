import { useTranslation } from "react-i18next";
import MembershipPricingSection from "../components/MembershipPricingSection";
import Footer from "../components/Footer";
import AdoptionCountriesSection from "../components/AdoptionCountriesSection";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col font-sans">
      {/* Hero */}
      <div className="relative w-full flex-1">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/family-adoption-and-parents-hug-child-love-and-h-2022-12-29-04-26-45-utc.jpg')",
            height: "540px",
            minHeight: "540px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 rounded-b-3xl"></div>
        </div>
        <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24" style={{ minHeight: "540px" }}>
          <span className="inline-block bg-[#1e3a5f]/80 text-white font-semibold px-5 py-2 rounded-full text-base shadow mb-6">
            {t("landing.socialMedia")}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 text-white drop-shadow-2xl">
            {t("landing.heroTitle")} <br />
            <span className="text-[#f97316]">{t("landing.heroHighlight")}</span>
          </h1>
          <p className="text-white/90 mb-10 text-xl drop-shadow-lg font-medium max-w-2xl mx-auto">
            {t("landing.heroText")}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
            <a
              href="#membership"
              className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-10 py-4 rounded-full text-xl shadow-lg transition-colors duration-200"
            >
              {t("landing.becomeMemberBtn")} &rarr;
            </a>
            <a
              href="#learn-more"
              className="inline-block bg-[#6b7280]/70 text-white font-bold px-10 py-4 rounded-full text-xl shadow hover:bg-[#374151]/80 transition-colors duration-200"
            >
              {t("landing.learnMoreBtn")}
            </a>
          </div>
          <div className="flex justify-center gap-20 text-white font-bold text-xl drop-shadow-lg">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">150+</span>
              <div className="text-base font-medium">{t("landing.countries")}</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">10K+</span>
              <div className="text-base font-medium">{t("landing.members")}</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold">24/7</span>
              <div className="text-base font-medium">{t("landing.support")}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Adoption Countries */}
      <AdoptionCountriesSection />

      {/* Membership & Pricing */}
      <MembershipPricingSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
