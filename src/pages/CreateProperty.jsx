import React, { useContext, useRef, useState, useEffect } from "react";
import axios from "axios";

import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Building2,
} from "lucide-react";
import { GlobalContext } from "../contexts/GlobalContext";
import Navbar from "../components/Navbar";

const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;

const currencyList = ["TRY", "USD", "EUR", "GBP"];
const categories = [
  { value: "apartment", label: "Apartman" },
  { value: "villa", label: "Villa" },
  { value: "house", label: "Müstakil Ev" },
  { value: "other", label: "Diğer" },
];

const CreateProperty = () => {
  const { backendURL } = useContext(GlobalContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_category: "apartment",
    layout_type: "",
    construction_year: "",
    min_price: "",
    max_price: "",
    currency: "TRY",
    city: "",
    address: "",
  });

  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // object URLs
  const [videos, setVideos] = useState([]); // File[]
  const [files, setFiles] = useState([]); // File[]

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const imgInputRef = useRef(null);
  const vidInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // get logged user_id (session or local)
  const isUserConfirm = () => {
    try {
      const ls = localStorage.getItem("authUser");
      const ss = sessionStorage.getItem("authUser");
      const user = ls ? JSON.parse(ls) : ss ? JSON.parse(ss) : null;
      if (user?.is_confirm === "1" && user?.is_activation === "1") {
        return user.id;
      } else {
        return 0; // not confirmed or activated
      }
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const stored =
      localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (stored) {
      try {
        const authUser = JSON.parse(stored);
        if (authUser.is_activation === "1" && authUser.is_confirm === "1") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (e) {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
    window.scrollTo(0, 0);
  }, []);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const pickImages = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const room = MAX_IMAGES - images.length;
    const toAdd = selected.slice(0, room);

    setImages((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const pickVideos = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const room = MAX_VIDEOS - videos.length;
    const toAdd = selected.slice(0, room);

    setVideos((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeVideo = (idx) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!form.description.trim()) return "Açıklama gereklidir.";
    if (!form.layout_type.trim()) return "Ev tipi (ör. 2+1) gereklidir.";
    if (!form.city.trim()) return "Şehir gereklidir.";
    if (!form.address.trim()) return "Adres gereklidir.";

    if (form.construction_year) {
      if (!/^\d{4}$/.test(form.construction_year))
        return "Yapım yılı 4 haneli olmalıdır (YYYY).";
      const y = Number(form.construction_year);
      const now = new Date().getFullYear();
      if (y < 1900 || y > now)
        return `Yapım yılı 1900 ile ${now} arasında olmalıdır.`;
    }

    if (form.min_price && isNaN(Number(form.min_price)))
      return "Minimum fiyat sayısal olmalıdır.";
    if (form.max_price && isNaN(Number(form.max_price)))
      return "Maksimum fiyat sayısal olmalıdır.";
    if (
      form.min_price &&
      form.max_price &&
      Number(form.min_price) > Number(form.max_price)
    )
      return "Minimum fiyat, maksimum fiyattan büyük olamaz.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    const user_id = isUserConfirm();
    if (!user_id) {
      setErr("Emlak ekleme özelliği sadece katıla özel üyelere özeldir.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("user_id", String(user_id));
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("property_category", form.property_category);
      fd.append("layout_type", form.layout_type);
      if (form.construction_year)
        fd.append("construction_year", form.construction_year);
      if (form.min_price) fd.append("min_price", form.min_price);
      if (form.max_price) fd.append("max_price", form.max_price);
      fd.append("currency", form.currency || "TRY");
      fd.append("city", form.city);
      fd.append("address", form.address);

      images.forEach((img) => fd.append("images[]", img, img.name));
      videos.forEach((v) => fd.append("videos[]", v, v.name));
      files.forEach((f) => fd.append("files[]", f, f.name));

      const res = await axios.post(`${backendURL}create_property.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        window.scrollTo(0, 0);
        setOk("İlan başarıyla oluşturuldu.");
        // reset
        imagePreviews.forEach((u) => URL.revokeObjectURL(u));
        setImages([]);
        setImagePreviews([]);
        setVideos([]);
        setFiles([]);
        setForm({
          title: "",
          description: "",
          property_category: "apartment",
          layout_type: "",
          construction_year: "",
          min_price: "",
          max_price: "",
          currency: "TRY",
          city: "",
          address: "",
        });
      } else {
        setErr(
          res.data?.message ||
            (Array.isArray(res.data?.errors)
              ? res.data.errors.join(" ")
              : "Kayıt başarısız.")
        );
      }
    } catch (e2) {
      console.log(e2);
      setErr(
        e2?.response?.data?.message ||
          e2.message ||
          "Sunucu hatası. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Üyelere Özel Alan
            </h1>
            <p className="text-gray-600 max-w-md">
              Bu sayfayı sadece katıla özel üyeler görüntüleyebilir. Lütfen
              hesabınızı doğrulayın veya giriş yapın.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="text-[#222]" />
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
            Yeni İlan Oluştur
          </h1>
        </div>

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

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 space-y-6"
        >
          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık (opsiyonel)
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChangeField}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="İlan başlığı"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChangeField}
              required
              rows={5}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="İlan detayları"
            />
          </div>

          {/* Kategori & Ev Tipi */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                name="property_category"
                value={form.property_category}
                onChange={onChangeField}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ev Tipi (ör. 2+1) *
              </label>
              <input
                type="text"
                name="layout_type"
                value={form.layout_type}
                onChange={onChangeField}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="2+1, 3+1 Dubleks, vb."
              />
            </div>
          </div>

          {/* Yapım Yılı & Şehir */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yapım Yılı (YYYY)
              </label>
              <input
                type="text"
                name="construction_year"
                value={form.construction_year}
                onChange={onChangeField}
                maxLength={4}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="2020"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şehir *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={onChangeField}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="İzmir"
              />
            </div>
          </div>

          {/* Adres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={onChangeField}
              required
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="Mahalle, cadde, no ..."
            />
          </div>

          {/* Fiyat & Para Birimi */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Fiyat
              </label>
              <input
                type="text"
                name="min_price"
                value={form.min_price}
                onChange={onChangeField}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="Örn: 2500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimum Fiyat
              </label>
              <input
                type="text"
                name="max_price"
                value={form.max_price}
                onChange={onChangeField}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="Örn: 4000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Para Birimi
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={onChangeField}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              >
                {currencyList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Görseller */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Görseller (en fazla {MAX_IMAGES})
              </label>
              <span className="text-xs text-gray-500">
                Seçilen: {images.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={pickImages}
                hidden
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                <Upload size={16} />
                Görsel Yükle
              </button>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imagePreviews.map((src, idx) => (
                  <div key={src} className="relative group">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Görseli kaldır"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videolar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Videolar (en fazla {MAX_VIDEOS})
              </label>
              <span className="text-xs text-gray-500">
                Seçilen: {videos.length}/{MAX_VIDEOS}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={vidInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                multiple
                onChange={pickVideos}
                hidden
              />
              <button
                type="button"
                onClick={() => vidInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                <Video size={16} />
                Video Yükle
              </button>
            </div>

            {videos.length > 0 && (
              <ul className="mt-3 space-y-2">
                {videos.map((v, idx) => (
                  <li
                    key={`${v.name}-${idx}`}
                    className="flex items-center justify-between rounded-md border p-2 bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{v.name}</span>
                      <span className="text-xs text-gray-400">
                        ({Math.ceil(v.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Belgeler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Belgeler (opsiyonel)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={pickFiles}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                hidden
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                <FileText size={16} />
                Dosya Ekle
              </button>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, idx) => (
                  <li
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between rounded-md border p-2 bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{f.name}</span>
                      <span className="text-xs text-gray-400">
                        ({Math.ceil(f.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#222] text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-[#333] transition disabled:opacity-60"
            >
              <Upload size={18} />
              {loading ? "Yükleniyor..." : "İlanı Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;
