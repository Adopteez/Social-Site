import { useTranslation } from "react-i18next";
import { FaQuoteLeft } from "react-icons/fa";

export default function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: "Sofie, adoptivmor",
      text: t("testimonials.sofie"),
    },
    {
      name: "Jonas, adopteret",
      text: t("testimonials.jonas"),
    },
    {
      name: "Marie, venter på at adoptere",
      text: t("testimonials.marie"),
    },
  ];

  return (
    <section className="w-full py-16 bg-[#f9fafb] flex flex-col items-center" id="testimonials">
      <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full text-sm mb-3">
        {t("testimonials.label")}
      </span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">
        {t("testimonials.title")}
      </h2>
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-white rounded-2xl shadow p-8 w-80"
          >
            <FaQuoteLeft size={28} className="text-[#f97316] mb-4" />
            <div className="italic text-gray-700 text-base mb-4 text-center">"{item.text}"</div>
            <div className="font-bold text-[#1e3a5f]">{item.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
