import { useTranslation } from "react-i18next";
import { FaComments, FaShieldAlt, FaUsers, FaGlobe } from "react-icons/fa";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FaUsers size={32} className="text-[#2563eb]" />,
      title: t("features.community"),
      desc: t("features.communityDesc"),
    },
    {
      icon: <FaComments size={32} className="text-[#f97316]" />,
      title: t("features.experienceSharing"),
      desc: t("features.experienceSharingDesc"),
    },
    {
      icon: <FaGlobe size={32} className="text-[#10b981]" />,
      title: t("features.globalAccess"),
      desc: t("features.globalAccessDesc"),
    },
    {
      icon: <FaShieldAlt size={32} className="text-[#a21caf]" />,
      title: t("features.safety"),
      desc: t("features.safetyDesc"),
    },
  ];

  return (
    <section className="w-full py-16 bg-white flex flex-col items-center" id="features">
      <span className="inline-block bg-orange-100 text-orange-800 font-semibold px-4 py-1 rounded-full text-sm mb-3">
        {t("features.label")}
      </span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6">
        {t("features.title")}
      </h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-gray-50 rounded-2xl shadow p-8 w-72"
          >
            {f.icon}
            <div className="mt-4 font-bold text-lg mb-2 text-[#1e3a5f]">{f.title}</div>
            <div className="text-gray-600 text-sm text-center">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
