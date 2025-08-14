import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/biva-black.png";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";

const kvkkText = `
KVKK Aydınlatma Metni

1. GİRİŞ
İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanununun (“KANUN”) 10. maddesi uyarınca T.C. KÜLTÜR VE TURİZM BAKANLIĞI (“VERİ SORUMLUSU”) tüzel kişiliğinde toplanan kişisel verilerin işlenmesine ilişkin veri sahiplerinin/ilgili kişilerin aydınlatılması amacı ile hazırlanmıştır.
VERİ SORUMLUSU, kişisel verilerin işlenmesi, korunması ve güvenliği hususuna azami hassasiyet ve gayret göstermektedir. Bu kapsamda ve KANUN gereğince ilgili kişilerin kişisel verileri VERİ SORUMLUSU sıfatıyla işlenebilecektir.

2. KİŞİSEL VERİLERİN İŞLENME AMACI
Kişisel veriler, Kanun’un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ile KANUN’da belirtilen amaçlar çerçevesinde ve sınırı olmamak kaydıyla aşağıda belirtilen amaçlarla işlenmektedir. Buna göre kişisel verilerin işlenme amacı [https://kvkk.ktb.gov.tr/TR-384075/aydinlatma-metinleri.html]’de yer alan, her bir faaliyet için oluşturulan aydınlatma metninde gösterilmektedir. VERİ SORUMLUSU, kişisel verilerin hukuka aykırı olarak işlenmesinin ve verilere hukuka aykırı olarak erişilmesinin önlenmesi ve kişisel verilerin güvenli bir şekilde muhafaza edilmesi amacıyla gerekli hukuki, teknik ve idari tedbirleri en üst seviyede almaya gayret göstermektedir.

3. KİŞİSEL VERİLERİN PAYLAŞILMASI VE AKTARILMASI
Çalışanlar, hizmet alıcıları, tedarikçiler ve vatandaşlardan toplanan kişisel veriler, Kanun’un 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde VERİ SORUMLUSU tedarikçileri, hizmet sağlayıcıları ve yasal olarak yetkili kurum ve kuruluşlar ile ilgili mevzuatlar çerçevesinde, kişisel veri işleme şartları ve amaçları doğrultusunda paylaşılabilecektir.
VERİ SORUMLUSU, kişisel verilerin paylaşılması halinde gerekli idari ve teknik tedbirleri, tüm güvenlik önlemlerini almaya özen göstermektedir. VERİ SORUMLUSU verilerinizin aktarılması ve paylaşılması hususunda dikkat ve özen yükümlülüğüne uymakta, verilerinize ve güvenliğine değer vermektedir.

4. KİŞİSEL VERİ TOPLAMA YÖNTEMİ VE HUKUKİ SEBEBİ
VERİ SORUMLUSU kişisel verileri, her türlü işitsel, yazılı, görsel ve elektronik yöntemle ve işbu aydınlatma metninde belirtilen amaçlar çerçevesinde, VERİ SORUMLUSU sunmuş olduğu hizmetlerin yasalara ve ilgili mevzuata uygun olarak sunulabilmesi ve yine Kurum’un sözleşme ve yasalardan doğan yükümlülüklerini eksiksiz olarak yerine getirebilmesi gibi birçok hukuki sebebe dayalı olarak toplamakta, KANUN’da belirtilen şartlara uygun olarak işlemekte, paylaşmakta ve aktarmaktadır. Hukuki dayanaklar; kvkk.ktb.gov.tr’de yer alan, her bir faaliyet için oluşturulan aydınlatma metninde gösterilmektedir.

5. KİŞİSEL VERİ SAHİPLERİNİN HAKLARI VE HAKLARIN KORUNMASI
Kişisel veri sahipleri KANUN’un 11. maddesi uyarınca;
1. Kişisel veri işlenip işlenmediğini öğrenme,
2. Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
3. Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
4. Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,
5. Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme,
6. Kanunun 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,
7. Kanunun 5. ve 6. maddeleri uyarınca yapılan işlemlerin, kişisel verilerin aktarıldığı
`;

const Register = () => {
  const navigate = useNavigate();
  const { backendURL } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    tc: "",
    telefon: "",
    adres: "",
    city: "",
    email: "",
    sifre: "",
    sifreOnay: "",
    kvkk: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (formData.sifre !== formData.sifreOnay) {
      setErr("Şifreler eşleşmiyor!");
      return;
    }
    if (!formData.kvkk) {
      setErr("KVKK onayını vermeniz gerekiyor!");
      return;
    }
    if (!/^\d{11}$/.test(formData.tc)) {
      setErr("TC Kimlik Numarası 11 haneli olmalıdır.");
      return;
    }
    if (formData.city === "") {
      setErr("Şehir seçimi gereklidir.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.ad,
        surname: formData.soyad,
        identitynumber: formData.tc,
        email: formData.email,
        password: formData.sifre,
        role: "User",
        phone: formData.telefon,
        address: formData.adres,
        city: formData.city,
      };

      const res = await axios.post(`${backendURL}register.php`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data?.success) {
        setOk("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");
        setTimeout(() => navigate("/uye-girisi"), 2000);
      } else {
        setErr(res.data?.message || "Kayıt işlemi başarısız.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.data?.errors
          ? error.response.data.errors.join(" ")
          : null) ||
        error?.message ||
        "Sunucu hatası. Lütfen tekrar deneyin.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-6xl gap-8 items-center">
          {/* Left: Logo */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <img
              src={logo}
              alt="Biva"
              className="w-3/4 h-auto object-contain"
            />
          </div>

          {/* Right: Form */}
          <section className="flex-1">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Bize Katıl
              </h2>
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Ad */}
                <div>
                  <label
                    htmlFor="ad"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ad
                  </label>
                  <input
                    type="text"
                    id="ad"
                    name="ad"
                    value={formData.ad}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Adınızı girin"
                  />
                </div>

                {/* Soyad */}
                <div>
                  <label
                    htmlFor="soyad"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="soyad"
                    name="soyad"
                    value={formData.soyad}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Soyadınızı girin"
                  />
                </div>

                {/* TC */}
                <div>
                  <label
                    htmlFor="tc"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    TC Numara
                  </label>
                  <input
                    type="text"
                    id="tc"
                    name="tc"
                    value={formData.tc}
                    onChange={handleChange}
                    required
                    maxLength={11}
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="TC Kimlik Numaranızı girin"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label
                    htmlFor="telefon"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Telefon numaranızı girin"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="E-posta adresinizi girin"
                  />
                </div>

                {/* Şifre */}
                <div>
                  <label
                    htmlFor="sifre"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Şifre
                  </label>
                  <input
                    type="password"
                    id="sifre"
                    name="sifre"
                    value={formData.sifre}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Şifrenizi girin"
                  />
                </div>

                {/* Şifre Onay */}
                <div>
                  <label
                    htmlFor="sifreOnay"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Şifre Onay
                  </label>
                  <input
                    type="password"
                    id="sifreOnay"
                    name="sifreOnay"
                    value={formData.sifreOnay}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Şehir
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Şehrinizi girin"
                  />
                </div>

                {/* Adres */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="adres"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adres
                  </label>
                  <textarea
                    id="adres"
                    name="adres"
                    value={formData.adres}
                    onChange={handleChange}
                    required
                    className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="Adresinizi girin"
                    rows="3"
                  />
                </div>

                {/* KVKK */}
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="kvkk"
                    name="kvkk"
                    checked={formData.kvkk}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <label htmlFor="kvkk" className="ml-2 text-sm text-gray-600">
                    <span
                      className="text-gray-900 underline cursor-pointer hover:text-gray-700"
                      onClick={() => setShowModal(true)}
                    >
                      KVKK
                    </span>{" "}
                    onaylıyorum.
                  </label>
                </div>

                {/* Alerts */}
                {(err || ok) && (
                  <div className="md:col-span-2">
                    {err && (
                      <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                        {err}
                      </div>
                    )}
                    {ok && (
                      <div className="mb-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
                        {ok}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#B259AF] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#A14A9E] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Kayıt yapılıyor..." : "Katıl"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* KVKK Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              KVKK Aydınlatma Metni
            </h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {kvkkText}
            </pre>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
