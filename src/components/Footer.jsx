import { useTranslation } from "react-i18next";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1e3a5f] text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-8">
        {/* Logo og beskrivelse */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/Adopteez uB-Photoroom.png"
              alt="Adopteez logo"
              className="h-10 w-10 object-contain rounded"
            />
            <span className="font-extrabold text-xl tracking-tight">Adopteez</span>
          </div>
          <p className="text-gray-200 text-sm max-w-xs">
            {t("footer.description")}
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={22} />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={22} />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={22} />
            </a>
          </div>
        </div>
        {/* Links */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="font-bold mb-2">{t("footer.quickLinks")}</div>
          <ul className="space-y-2 text-gray-200 text-sm">
            <li><a href="/home" className="hover:underline">{t("nav.home")}</a></li>
            <li><a href="/groups" className="hover:underline">{t("nav.groups")}</a></li>
            <li><a href="/membership" className="hover:underline">{t("nav.membership")}</a></li>
            <li><a href="/about" className="hover:underline">{t("nav.about")}</a></li>
            <li><a href="/blog" className="hover:underline">{t("footer.blog")}</a></li>
          </ul>
        </div>
        {/* Kontakt */}
        <div className="flex-1">
          <div className="font-bold mb-2">{t("footer.contact")}</div>
          <p className="text-gray-200 text-sm mb-1">
            <span className="font-medium">{t("footer.addressLabel")}:</span> Slengeriksvej 3<br />
            5500 Middelfart, Denmark
          </p>
          <p className="text-gray-200 text-sm">
            <span className="font-medium">{t("footer.emailLabel")}:</span> info@adopteez.com
          </p>
        </div>
      </div>
      <div className="text-center text-gray-400 text-xs mt-10">
        © 2026 Adopteez. {t("footer.rights")}
      </div>
    </footer>
  );
}
