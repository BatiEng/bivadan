import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import logo from "../assets/biva-logo.png"; // Ensure the file exists

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Branding */}
          <div className="flex flex-col items-center md:items-start">
            <img
              src={logo}
              alt="Biva Logo"
              className="h-16 w-auto mb-4 transition-transform duration-300 hover:scale-105"
            />
            <p className="text-[#B259AF] text-sm text-center md:text-left">
              Biva - Geleceğinizi inşa eder...
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-gray-300 text-sm text-center md:text-left">
              <li>
                <a
                  href="/about"
                  className="hover:text-white transition-colors duration-200"
                >
                  Hakkımızda
                </a>
              </li>
              <li>
                <a
                  href="/projects"
                  className="hover:text-white transition-colors duration-200"
                >
                  Projeler
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors duration-200"
                >
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info and Social Media */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">Bizi Ulaşın</h3>
            <ul className="space-y-3 text-gray-300 text-sm text-center md:text-left">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Phone size={18} className="text-[#B259AF]" />
                <span>0 553 469 7273</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Mail size={18} className="text-[#B259AF]" />
                <span>info@bivadan.com.tr</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={18} className="text-[#B259AF]" />
                <span className="text-center md:text-left">
                  {" "}
                  Mansuroğlu Mahallesi İslam Kerimov Caddesi no:14
                  Bayraklı/İZMİR
                </span>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Instagram size={24} className="text-[#B259AF]" />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Facebook size={24} className="text-[#B259AF]" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Twitter size={24} className="text-[#B259AF]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Biva. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
