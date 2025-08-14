import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import VerticalNavbar from "../../components/VerticalNavbar";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Calendar,
  Video,
} from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";

const MAX_IMAGES = 10;
const MAX_VIDEOS = 5; // New limit for videos
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp"];
const ALLOWED_VIDEO_EXT = ["mp4", "webm", "ogg"]; // New video extensions
const ALLOWED_FILE_EXT = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "rar",
  "txt",
];

const AdminAddProject = () => {
  const { backendURL } = useContext(GlobalContext);
  const [form, setForm] = useState({
    baslik: "",
    aciklama: "",
    baslamaTarihi: "",
  });

  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // object URLs
  const [videos, setVideos] = useState([]); // File[] for videos
  const [videoPreviews, setVideoPreviews] = useState([]); // object URLs for videos
  const [files, setFiles] = useState([]); // File[]

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const imgInputRef = useRef(null);
  const videoInputRef = useRef(null); // New ref for video input
  const fileInputRef = useRef(null);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validateExt = (file, allowed) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    return allowed.includes(ext);
  };

  const onPickImages = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const room = MAX_IMAGES - images.length;
    const toAdd = selected.slice(0, room);

    const problems = [];
    const safe = [];

    toAdd.forEach((f) => {
      if (!validateExt(f, ALLOWED_IMAGE_EXT)) {
        problems.push(`${f.name}: Geçersiz görsel türü.`);
      } else if (f.size > MAX_FILE_SIZE) {
        problems.push(`${f.name}: Dosya boyutu 50MB'ı aşamaz.`);
      } else {
        safe.push(f);
      }
    });

    if (problems.length) setErr(problems.join(" "));

    if (safe.length) {
      setImages((prev) => [...prev, ...safe]);
      const newPreviews = safe.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onPickVideos = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const room = MAX_VIDEOS - videos.length;
    const toAdd = selected.slice(0, room);

    const problems = [];
    const safe = [];

    toAdd.forEach((f) => {
      if (!validateExt(f, ALLOWED_VIDEO_EXT)) {
        problems.push(`${f.name}: Geçersiz video türü.`);
      } else if (f.size > MAX_FILE_SIZE) {
        problems.push(`${f.name}: Dosya boyutu 50MB'ı aşamaz.`);
      } else {
        safe.push(f);
      }
    });

    if (problems.length) setErr(problems.join(" "));
    if (safe.length) {
      setVideos((prev) => [...prev, ...safe]);
      const newPreviews = safe.map((f) => URL.createObjectURL(f));
      setVideoPreviews((prev) => [...prev, ...newPreviews]);
    }

    e.target.value = "";
  };

  const removeVideo = (idx) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
    setVideoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onPickFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const problems = [];
    const safe = [];

    selected.forEach((f) => {
      if (!validateExt(f, ALLOWED_FILE_EXT)) {
        problems.push(`${f.name}: Geçersiz dosya türü.`);
      } else if (f.size > MAX_FILE_SIZE) {
        problems.push(`${f.name}: Dosya boyutu 50MB'ı aşamaz.`);
      } else {
        safe.push(f);
      }
    });

    if (problems.length) setErr(problems.join(" "));
    if (safe.length) setFiles((prev) => [...prev, ...safe]);

    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.baslik.trim()) return setErr("Başlık gereklidir.");
    if (!form.aciklama.trim()) return setErr("Açıklama gereklidir.");
    if (!form.baslamaTarihi) return setErr("Başlama tarihi gereklidir.");
    if (images.length > MAX_IMAGES)
      return setErr(`En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz.`);
    if (videos.length > MAX_VIDEOS)
      return setErr(`En fazla ${MAX_VIDEOS} video yükleyebilirsiniz.`);

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", form.baslik);
      fd.append("description", form.aciklama);
      fd.append("start_date", form.baslamaTarihi);

      images.forEach((img) => fd.append("images[]", img, img.name));
      videos.forEach((vid) => fd.append("videos[]", vid, vid.name));
      files.forEach((f) => fd.append("files[]", f, f.name));

      const res = await axios.post(`${backendURL}create_project.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res);
      if (res.data?.success) {
        setOk("Proje başarıyla oluşturuldu.");
        // reset
        setForm({ baslik: "", aciklama: "", baslamaTarihi: "" });
        imagePreviews.forEach((src) => URL.revokeObjectURL(src));
        videoPreviews.forEach((src) => URL.revokeObjectURL(src));
        setImages([]);
        setImagePreviews([]);
        setVideos([]);
        setVideoPreviews([]);
        setFiles([]);
        window.scrollTo(0, 0);
      } else {
        const msg =
          res.data?.message ||
          (Array.isArray(res.data?.errors)
            ? res.data.errors.join(" ")
            : null) ||
          "Kayıt başarısız.";
        setErr(msg);
      }
    } catch (error) {
      console.log(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Sunucu hatası. Lütfen tekrar deneyin.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // Revoke leftover object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
      videoPreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [imagePreviews, videoPreviews]);

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Proje Ekle
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
              name="baslik"
              value={form.baslik}
              onChange={onChangeField}
              required
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="Proje başlığı"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              name="aciklama"
              value={form.aciklama}
              onChange={onChangeField}
              required
              rows={5}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="Proje hakkında ayrıntılı bilgi"
            />
          </div>

          {/* Başlama Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlama Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                name="baslamaTarihi"
                value={form.baslamaTarihi}
                onChange={onChangeField}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] pr-10"
              />
              <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Görseller (max 10) */}
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
                onChange={onPickImages}
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

            {images.length >= MAX_IMAGES && (
              <p className="mt-2 text-xs text-gray-500">
                En fazla {MAX_IMAGES} görsel yükleyebilirsiniz.
              </p>
            )}
          </div>

          {/* Videolar (max 5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Videolar (en fazla {MAX_VIDEOS} dosya - dosya boyutu en fazla
                50MB)
              </label>
              <span className="text-xs text-gray-500">
                Seçilen: {videos.length}/{MAX_VIDEOS}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={onPickVideos}
                hidden
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                <Upload size={16} />
                Video Yükle
              </button>
            </div>

            {videoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {videoPreviews.map((src, idx) => (
                  <div key={src} className="relative group">
                    <video
                      src={src}
                      controls
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Videoyu kaldır"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {videos.length >= MAX_VIDEOS && (
              <p className="mt-2 text-xs text-gray-500">
                En fazla {MAX_VIDEOS} video yükleyebilirsiniz.
              </p>
            )}
          </div>

          {/* Proje Dosyaları (pdf/doc/xls/ppt/zip vs.) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proje Dosyaları (opsiyonel)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onPickFiles}
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
              {loading ? "Yükleniyor..." : "Projeyi Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProject;
