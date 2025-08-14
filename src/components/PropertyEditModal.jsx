// src/components/PropertyEditModal.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Film,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import axios from "axios";

const TextInput = (p) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {p.label}
    </label>
    <input
      type={p.type || "text"}
      name={p.name}
      value={p.value ?? ""}
      onChange={p.onChange}
      className="w-full px-3 py-2 border rounded-lg"
      placeholder={p.placeholder}
    />
  </div>
);

const TextArea = (p) => (
  <div className={p.className || ""}>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {p.label}
    </label>
    <textarea
      name={p.name}
      rows={p.rows || 4}
      value={p.value ?? ""}
      onChange={p.onChange}
      className="w-full px-3 py-2 border rounded-lg"
      placeholder={p.placeholder}
    />
  </div>
);

export default function PropertyEditModal({
  backendURL,
  propertyId,
  user, // {id, role}
  onClose,
  close,
  fetch,
  onSaved, // (updatedSummaryRow) => void
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Base fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    property_category: "",
    layout_type: "",
    construction_year: "",
    min_price: "",
    max_price: "",
    currency: "TRY",
    city: "",
    address: "",
    is_active: 1,
    cover_image_id: null,
  });

  // Existing media
  const [images, setImages] = useState([]); // [{id, image_path, is_cover}]
  const [videos, setVideos] = useState([]); // [{id, video_path}]
  const [files, setFiles] = useState([]); // [{id, file_path, original_name}]

  // New uploads
  const [newImages, setNewImages] = useState([]); // File[]
  const [newVideos, setNewVideos] = useState([]); // File[]
  const [newFiles, setNewFiles] = useState([]); // File[]

  // Deletions
  const [delImages, setDelImages] = useState([]); // ids
  const [delVideos, setDelVideos] = useState([]); // ids
  const [delFiles, setDelFiles] = useState([]); // ids

  const panelRef = useRef(null);

  // --- Lock body scroll while modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    // focus the panel
    setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      const y = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, []);

  // --- Keyboard: ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_property_by_id.php`, {
        params: { id: propertyId },
      });
      if (!res.data?.success)
        throw new Error(res.data?.message || "Kayıt alınamadı.");

      const p = res.data.data.property;
      setForm({
        title: p.title || "",
        description: p.description || "",
        property_category: p.property_category || "",
        layout_type: p.layout_type || "",
        construction_year: p.construction_year || "",
        min_price: p.min_price ?? "",
        max_price: p.max_price ?? "",
        currency: p.currency || "TRY",
        city: p.city || "",
        address: p.address || "",
        is_active: Number(p.is_active ?? 1),
        cover_image_id:
          p.images?.find?.((x) => Number(x.is_cover) === 1)?.id ?? null,
      });
      setImages(p.images || []);
      setVideos(p.videos || []);
      setFiles(p.files || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) fetchDetails(); // eslint-disable-next-line
  }, [propertyId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const askConfirm = (msg) => window.confirm(msg);

  const markDelete = (type, id) => {
    if (!askConfirm("Silmek istediğinizden emin misiniz?")) return;
    if (type === "image") setDelImages((d) => [...d, id]);
    if (type === "video") setDelVideos((d) => [...d, id]);
    if (type === "file") setDelFiles((d) => [...d, id]);
  };

  const unmarkDelete = (type, id) => {
    if (type === "image") setDelImages((d) => d.filter((x) => x !== id));
    if (type === "video") setDelVideos((d) => d.filter((x) => x !== id));
    if (type === "file") setDelFiles((d) => d.filter((x) => x !== id));
  };

  const setCover = (id) => setForm((f) => ({ ...f, cover_image_id: id }));

  const submit = async () => {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      const fd = new FormData();
      fd.append("property_id", propertyId);
      fd.append("actor_user_id", user?.id || 0);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("property_category", form.property_category);
      fd.append("layout_type", form.layout_type);
      fd.append("construction_year", form.construction_year);
      fd.append("min_price", String(form.min_price ?? ""));
      fd.append("max_price", String(form.max_price ?? ""));
      fd.append("currency", form.currency);
      fd.append("city", form.city);
      fd.append("address", form.address);
      fd.append("is_active", String(form.is_active ?? 1));
      if (form.cover_image_id)
        fd.append("cover_image_id", String(form.cover_image_id));

      // deletions
      delImages.forEach((id) => fd.append("delete_images[]", String(id)));
      delVideos.forEach((id) => fd.append("delete_videos[]", String(id)));
      delFiles.forEach((id) => fd.append("delete_files[]", String(id)));

      // new uploads
      newImages.forEach((f) => fd.append("images[]", f, f.name));
      newVideos.forEach((f) => fd.append("videos[]", f, f.name));
      newFiles.forEach((f) => fd.append("files[]", f, f.name));

      const res = await axios.post(`${backendURL}update_property.php`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            (Array.isArray(res.data?.errors)
              ? res.data.errors.join(" ")
              : "Güncelleme başarısız.")
        );
      }

      setOk("İlan güncellendi.");
      close();
      fetch(user.id);
      onSaved?.(res.data.data?.summary || null);
      await fetchDetails();
      setNewImages([]);
      setNewVideos([]);
      setNewFiles([]);
      setDelImages([]);
      setDelVideos([]);
      setDelFiles([]);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const removeNew = (type, idx) => {
    if (!askConfirm("Silmek istediğinizden emin misiniz?")) return;
    if (type === "image")
      setNewImages((arr) => arr.filter((_, i) => i !== idx));
    if (type === "video")
      setNewVideos((arr) => arr.filter((_, i) => i !== idx));
    if (type === "file") setNewFiles((arr) => arr.filter((_, i) => i !== idx));
  };

  if (!propertyId) return null;

  return (
    // Overlay: fixed + scrollable
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-start justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // backdrop click closes
    >
      {/* Spacer to keep panel away from edges */}
      <div className="min-h-[8vh]" />

      {/* Modal panel: max height + own scroll */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative my-8 w-full max-w-5xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto overscroll-contain focus:outline-none"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-white/95 backdrop-blur">
          <h3 className="text-lg font-semibold">İlanı Düzenle</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {err}
            </div>
          )}
          {ok && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              {ok}
            </div>
          )}

          {loading ? (
            <div className="text-gray-500">Yükleniyor…</div>
          ) : (
            <>
              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Başlık"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                />
                <TextInput
                  label="Kategori"
                  name="property_category"
                  value={form.property_category}
                  onChange={onChange}
                  placeholder="Apartman / Villa / Daire …"
                />
                <TextInput
                  label="Tip (1+1, 2+1…)"
                  name="layout_type"
                  value={form.layout_type}
                  onChange={onChange}
                />
                <TextInput
                  label="Yapım Yılı"
                  name="construction_year"
                  value={form.construction_year}
                  onChange={onChange}
                />
                <TextInput
                  label="Min Fiyat"
                  name="min_price"
                  value={form.min_price}
                  onChange={onChange}
                  type="number"
                />
                <TextInput
                  label="Max Fiyat"
                  name="max_price"
                  value={form.max_price}
                  onChange={onChange}
                  type="number"
                />
                <TextInput
                  label="Para Birimi"
                  name="currency"
                  value={form.currency}
                  onChange={onChange}
                  placeholder="TRY"
                />
                <TextInput
                  label="Şehir"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                />
                <TextInput
                  label="Adres"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                />
                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    name="is_active"
                    checked={Number(form.is_active) === 1}
                    onChange={onChange}
                  />
                  <label htmlFor="is_active" className="text-sm">
                    Aktif
                  </label>
                </div>
              </div>
              <TextArea
                label="Açıklama"
                name="description"
                value={form.description}
                onChange={onChange}
              />

              {/* Existing Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Görseller</h4>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <Upload size={16} />
                    Yeni Görsel Ekle
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) =>
                        setNewImages([
                          ...(newImages || []),
                          ...Array.from(e.target.files || []),
                        ])
                      }
                    />
                  </label>
                </div>

                {images.length === 0 ? (
                  <div className="text-sm text-gray-500">Görsel yok.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((im) => {
                      const marked = delImages.includes(im.id);
                      return (
                        <div
                          key={im.id}
                          className={`relative border rounded-lg overflow-hidden ${
                            marked ? "opacity-50" : ""
                          }`}
                        >
                          <img
                            src={backendURL + im.image_path}
                            alt=""
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-1 left-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => setCover(im.id)}
                              className={`text-xs px-2 py-0.5 rounded ${
                                Number(form.cover_image_id) === Number(im.id)
                                  ? "bg-green-600 text-white"
                                  : "bg-white/80"
                              }`}
                            >
                              Kapak
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              marked
                                ? unmarkDelete("image", im.id)
                                : markDelete("image", im.id)
                            }
                            className="absolute top-1 right-1 bg-black/60 text-white rounded p-1"
                            title={marked ? "Geri al" : "Sil"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New images preview list */}
                {newImages.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Eklenecek Görseller:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {newImages.map((f, idx) => (
                        <div
                          key={idx}
                          className="relative border rounded-lg p-2 flex items-center gap-2"
                        >
                          <ImageIcon size={16} className="text-gray-500" />
                          <div className="text-xs truncate">{f.name}</div>
                          <button
                            onClick={() => removeNew("image", idx)}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Videos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Videolar</h4>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <Upload size={16} />
                    Yeni Video Ekle
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      multiple
                      hidden
                      onChange={(e) =>
                        setNewVideos([
                          ...(newVideos || []),
                          ...Array.from(e.target.files || []),
                        ])
                      }
                    />
                  </label>
                </div>

                {videos.length === 0 ? (
                  <div className="text-sm text-gray-500">Video yok.</div>
                ) : (
                  <ul className="space-y-2">
                    {videos.map((v) => {
                      const marked = delVideos.includes(v.id);
                      return (
                        <li
                          key={v.id}
                          className={`flex items-center gap-2 border rounded-lg p-2 ${
                            marked ? "opacity-50" : ""
                          }`}
                        >
                          <Film size={16} className="text-gray-500" />
                          <a
                            href={backendURL + v.video_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Videoyu Aç
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              marked
                                ? unmarkDelete("video", v.id)
                                : markDelete("video", v.id)
                            }
                            className="ml-auto text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {newVideos.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Eklenecek Videolar:
                    </div>
                    <ul className="space-y-2">
                      {newVideos.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 border rounded-lg p-2"
                        >
                          <Film size={16} className="text-gray-500" />
                          <div className="text-xs truncate">{f.name}</div>
                          <button
                            onClick={() => removeNew("video", idx)}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Existing Files */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Dosyalar</h4>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <Upload size={16} />
                    Yeni Dosya Ekle
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                      hidden
                      onChange={(e) =>
                        setNewFiles([
                          ...(newFiles || []),
                          ...Array.from(e.target.files || []),
                        ])
                      }
                    />
                  </label>
                </div>

                {files.length === 0 ? (
                  <div className="text-sm text-gray-500">Dosya yok.</div>
                ) : (
                  <ul className="space-y-2">
                    {files.map((f) => {
                      const marked = delFiles.includes(f.id);
                      return (
                        <li
                          key={f.id}
                          className={`flex items-center gap-2 border rounded-lg p-2 ${
                            marked ? "opacity-50" : ""
                          }`}
                        >
                          <FileText size={16} className="text-gray-500" />
                          <a
                            href={backendURL + f.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {f.original_name || "Dosya"}
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              marked
                                ? unmarkDelete("file", f.id)
                                : markDelete("file", f.id)
                            }
                            className="ml-auto text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {newFiles.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Eklenecek Dosyalar:
                    </div>
                    <ul className="space-y-2">
                      {newFiles.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 border rounded-lg p-2"
                        >
                          <FileText size={16} className="text-gray-500" />
                          <div className="text-xs truncate">{f.name}</div>
                          <button
                            onClick={() => removeNew("file", idx)}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-5 pb-5 flex items-center justify-end gap-2 border-t sticky bottom-0 bg-white/95 backdrop-blur">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Kapat
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded bg-[#222] text-white hover:bg-[#333] disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Upload size={16} />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Spacer bottom for small screens */}
      <div className="min-h-[8vh]" />
    </div>
  );
}
