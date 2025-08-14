import React, { useState, useContext } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";

const Contact = () => {
  const { backendURL } = useContext(GlobalContext); // e.g. https://www.inovasyonbulutu.com/bivadan/api/
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    // Basic validations
    if (
      !formData.name ||
      !formData.phone ||
      !formData.subject ||
      !formData.message
    ) {
      setErr("Lütfen tüm alanları doldurun.");
      return;
    }

    const phone = formData.phone.replace(/\s+/g, "");
    const trPhoneRegex = /^\+?(\d{2})?0?\d{10}$/; // +90 / 90 / 0 önekleri desteklenir
    if (!trPhoneRegex.test(phone)) {
      setErr(
        "Telefon numarası geçerli formatta olmalıdır. (Örn: 05XXXXXXXXX, +905XXXXXXXXX, 905XXXXXXXXX)"
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        phone: phone,
        topic: formData.subject, // map subject -> topic
        message: formData.message,
      };

      const res = await axios.post(`${backendURL}create_message.php`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.success) {
        setOk(
          "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz."
        );
        setFormData({ name: "", phone: "", subject: "", message: "" });
      } else {
        const msg = Array.isArray(res.data?.message)
          ? res.data.message.join(" ")
          : res.data?.message || "Gönderim başarısız.";
        setErr(msg);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(" ")
          : null) ||
        error?.message ||
        "Sunucu hatası. Lütfen tekrar deneyin.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-4 tracking-tight">
            İletişim
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Hayalindeki proje için bize ulaş
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6">
                Bize Ulaşın
              </h3>
              <ul className="space-y-6 text-gray-600">
                <li className="flex items-center gap-3">
                  <Phone size={24} className="text-[#B259AF]" />
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">Telefon</p>
                    <a
                      href="tel:+905534697273"
                      className="hover:text-[#444] transition-colors duration-200"
                      aria-label="Telefon numarası: +90 553 469 7273"
                    >
                      0 553 469 7273
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={24} className="text-[#B259AF]" />
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">E-posta</p>
                    <a
                      href="mailto:info@bivadan.com.tr"
                      className="hover:text-[#444] transition-colors duration-200"
                      aria-label="E-posta: info@bivadan.com.tr"
                    >
                      info@bivadan.com.tr
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={24} className="text-[#B259AF]" />
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">Adres</p>
                    <p>
                      Mansuroğlu Mahallesi İslam Kerimov Caddesi no:14
                      Bayraklı/İZMİR
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6">
                Mesaj Gönder
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                    placeholder="Adınızı ve soyadınızı girin"
                    aria-label="Ad Soyad"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                    placeholder="+90 555 555 55 55"
                    aria-label="Telefon Numarası"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    Konu
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                    placeholder="Mesajınızın konusu"
                    aria-label="Konu"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    Size nasıl yardımcı olabiliriz?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400 resize-none"
                    placeholder="Mesajınızı buraya yazın"
                    aria-label="Size nasıl yardımcı olabiliriz?"
                  ></textarea>
                </div>
                {/* Alerts */}
                {(err || ok) && (
                  <div
                    className={`mb-4 rounded-lg border p-3 text-sm ${
                      err
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {err || ok}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B259AF] text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-[#A14A9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222] disabled:opacity-60 cursor-pointer"
                  aria-label="Mesajı gönder"
                >
                  {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
              </form>
            </div>
          </div>

          {/* Google Maps Iframe */}
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3124.5785102579093!2d27.177609875981908!3d38.45120357290799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b962af2535553b%3A0xb651ccd88938dced!2sBiva%20Tower%20Sat%C4%B1%C5%9F%20Ofisi!5e0!3m2!1str!2str!4v1754916571196!5m2!1str!2str"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Biva Konum Haritası"
              aria-label="Biva'nın İstanbul, Türkiye'deki konumu için interaktif harita"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
