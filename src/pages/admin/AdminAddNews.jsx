// src/pages/AddNews.jsx
import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../../contexts/GlobalContext";
import VerticalNavbar from "../../components/VerticalNavbar";
import {
  Upload,
  Image as ImageIcon,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const AdminAddNews = () => {
  const { backendURL } = useContext(GlobalContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const imgInputRef = useRef(null);

  const onPickImage = (e) => {
    const f = (e.target.files || [])[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsActive(true);
    clearImage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!title.trim()) return setErr("Başlık gereklidir.");
    if (!description.trim()) return setErr("Açıklama gereklidir.");
    if (!imageFile) return setErr("Lütfen bir kapak görseli seçin.");

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("is_active", isActive ? "1" : "0");
      fd.append("image", imageFile, imageFile.name);

      const res = await axios.post(`${backendURL}create_news.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res);
      if (res.data?.success) {
        setOk("Haber başarıyla eklendi.");
        resetForm();
      } else {
        const msg =
          res.data?.message ||
          (Array.isArray(res.data?.errors)
            ? res.data.errors.join(" ")
            : null) ||
          "Kayıt başarısız.";
        setErr(msg);
      }
    } catch (e2) {
      console.log(e2);
      const msg =
        e2?.response?.data?.errors[0] ||
        e2?.message ||
        "Sunucu hatası. Lütfen tekrar deneyin.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Haber Ekle
        </h1>

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
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
              required
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="Haber başlığı"
            />
            <div className="text-xs text-gray-400 mt-1">{title.length}/180</div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="Haber içeriği / açıklaması"
            />
          </div>

          {/* Aktiflik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yayın Durumu
            </label>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
            >
              {isActive ? (
                <>
                  <ToggleRight size={18} className="text-green-600" /> Aktif
                </>
              ) : (
                <>
                  <ToggleLeft size={18} className="text-gray-400" /> Pasif
                </>
              )}
            </button>
          </div>

          {/* Kapak Görseli */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Kapak Görseli
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50"
                >
                  <X size={14} /> Kaldır
                </button>
              )}
            </div>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={28} />
                <p className="text-sm text-gray-600 mb-3">
                  .jpg, .jpeg, .png, .gif, .webp (maks. 10MB)
                </p>
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                  <Upload size={16} />
                  Görsel Seç
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  hidden
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full max-h-96 object-cover"
                />
                <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate">
                    {imageFile?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:bg-white"
                  >
                    <Upload size={14} />
                    Değiştir
                  </button>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onPickImage}
                    hidden
                  />
                </div>
              </div>
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
              {loading ? "Yükleniyor..." : "Haberi Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddNews;
