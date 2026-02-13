import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function FAQSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
  ];

  return (
    <section className="w-full py-16 bg-white flex flex-col items-center" id="faq">
      <span className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-1 rounded-full text-sm mb-3">
        {t("faq.label")}
      </span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">
        {t("faq.title")}
      </h2>
      <div className="w-full max-w-3xl mx-auto space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-lg shadow p-5 cursor-pointer"
            onClick={() => setOpen(open === idx ? null : idx)}
          >
            <div className="flex items-center justify-between font-bold text-lg text-[#1e3a5f]">
              <span>{item.question}</span>
              <FaChevronDown className={`ml-2 transition-transform ${open === idx ? "rotate-180" : ""}`} />
            </div>
            {open === idx && (
              <div className="mt-3 text-gray-700 text-base">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
