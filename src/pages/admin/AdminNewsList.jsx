import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";
import VerticalNavbar from "../../components/VerticalNavbar";

// Reusing the Badge component from AdminAllUsers
const Badge = ({ children, color = "gray" }) => {
  const map = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${map[color]}`}
    >
      {children}
    </span>
  );
};

// Reusing the Toggle component from AdminAllUsers
const Toggle = ({
  checked,
  onChange,
  disabled = false,
  labelOn = "On",
  labelOff = "Off",
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange(!checked);
    }}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition
      ${checked ? "bg-green-500" : "bg-gray-300"} ${
      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition
        ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
    <span className="sr-only">{checked ? labelOn : labelOff}</span>
  </button>
);

const AdminNewsList = () => {
  const { backendURL } = useContext(GlobalContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Server-side state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filters/sort
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const [updatingKey, setUpdatingKey] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    description: "",
    image: "",
    is_active: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [imageFile, setImageFile] = useState(null); // For image uploads

  const allowedSorts = ["id", "title", "created_at", "is_active"];

  const fetchNews = async () => {
    try {
      setLoading(true);
      setErr("");

      const params = {
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        sort: allowedSorts.includes(sortBy) ? sortBy : "created_at",
        order,
      };
      if (isActive !== "") params.is_active = isActive;

      const res = await axios.get(`${backendURL}get_news.php`, { params });

      if (res.data?.success) {
        setNews(res.data.data || []);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setErr(res.data?.message || "Haberler alınamadı.");
        setNews([]);
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
      );
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, perPage, isActive, sortBy, order]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchNews();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleSort = (col) => {
    if (!allowedSorts.includes(col)) return;
    if (sortBy === col) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  const SortIcon = ({ col }) =>
    sortBy === col ? (
      order === "asc" ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : null;

  const headerCell = (label, colKey) => (
    <th
      scope="col"
      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
      onClick={() => toggleSort(colKey)}
    >
      <div className="inline-flex items-center gap-1">
        {label} <SortIcon col={colKey} />
      </div>
    </th>
  );

  const updateStatus = async (newsId, patch) => {
    const keyName = `${newsId}:is_active`;
    setUpdatingKey(keyName);

    // Optimistic UI
    const prev = news.map((n) => ({ ...n }));
    setNews((ns) => ns.map((n) => (n.id === newsId ? { ...n, ...patch } : n)));

    try {
      const res = await axios.post(
        `${backendURL}update_news.php`,
        {
          news_id: newsId,
          ...patch,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Güncelleme başarısız.");
      }
      if (res.data?.data) {
        setNews((ns) =>
          ns.map((n) => (n.id === newsId ? { ...n, ...res.data.data } : n))
        );
      }
    } catch (e) {
      setNews(prev);
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Güncelleme yapılamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  // Row click -> open modal
  const openEdit = (n) => {
    setSaveErr("");
    setEditForm({
      id: n.id,
      title: n.title || "",
      description: n.description || "",
      image: n.image || "",
      is_active: Number(n.is_active) || 0,
    });
    setImageFile(null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (!saving) setEditOpen(false);
  };

  const onEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setEditForm((p) => ({ ...p, image: file.name }));
    }
  };

  const onSave = async () => {
    setSaveErr("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("news_id", editForm.id);
      formData.append("title", editForm.title.trim());
      formData.append("description", editForm.description.trim());
      formData.append("is_active", Number(editForm.is_active));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.post(`${backendURL}update_news.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            (Array.isArray(res.data?.errors)
              ? res.data.errors.join(" ")
              : "") ||
            "Güncelleme başarısız."
        );
      }

      // Update table row with merged data
      const updated = res.data.data;
      setNews((ns) =>
        ns.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
      );
      setEditOpen(false);
      fetchNews();
    } catch (e) {
      setSaveErr(
        e?.response?.data?.errors ||
          e?.message ||
          "Haber güncellenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setSaving(false);
    }
  };

  // Index number for table
  const rowIndex = (i) => (page - 1) * perPage + i + 1;

  return (
    <div className="flex min-h-screen">
      <VerticalNavbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Haberler
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-3">
            {/* Search */}
            <div className="relative w-full sm:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Başlık ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            {/* Active Status */}
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Durum (Tümü)</option>
              <option value="1">Aktif</option>
              <option value="0">Pasif</option>
            </select>

            {/* Per page */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] lg:ml-auto"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/sayfa
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  #
                </th>
                {headerCell("Resim", "image")}
                {headerCell("Başlık", "title")}
                {headerCell("Açıklama", "description")}
                {headerCell("Tarih", "created_at")}
                {headerCell("Durum", "is_active")}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && news.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Haber bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                news.map((n, i) => {
                  const keyActive = `${n.id}:is_active`;
                  return (
                    <tr
                      key={n.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEdit(n)}
                    >
                      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
                        {rowIndex(i)}
                      </td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">
                        {n.image ? (
                          <img
                            src={`${backendURL}${n.image}`}
                            alt={n.title || "Haber Resmi"}
                            className="h-16 w-24 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">Yok</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {n.title || "Başlık Yok"}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {n.description?.slice(0, 80) || "Açıklama Yok"}...
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {n.created_at && !isNaN(new Date(n.created_at))
                          ? format(new Date(n.created_at), "dd MMM yyyy", {
                              locale: tr,
                            })
                          : "-"}
                      </td>
                      <td
                        className="px-3 py-2 text-sm whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={String(n.is_active) === "1"}
                            disabled={updatingKey === keyActive}
                            labelOn="Aktif"
                            labelOff="Pasif"
                            onChange={(next) =>
                              updateStatus(n.id, { is_active: next ? 1 : 0 })
                            }
                          />
                          <Badge
                            color={
                              String(n.is_active) === "1" ? "green" : "red"
                            }
                          >
                            {String(n.is_active) === "1" ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <div className="text-sm text-gray-600">
            Sayfa {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1 px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Geri
            </button>
            <button
              className="inline-flex items-center gap-1 px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              İleri <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {err}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-lg font-semibold">Haberi Düzenle</h3>
              <button
                onClick={closeEdit}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {saveErr && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {saveErr}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Başlık
                  </label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Resim
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                  {editForm.image && (
                    <span className="text-xs text-gray-600 mt-1 block">
                      Mevcut: {editForm.image}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Durum
                  </label>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={editForm.is_active === 1}
                      onChange={(checked) =>
                        setEditForm((p) => ({
                          ...p,
                          is_active: checked ? 1 : 0,
                        }))
                      }
                      labelOn="Aktif"
                      labelOff="Pasif"
                    />
                    <span className="text-xs text-gray-600">
                      {editForm.is_active === 1 ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-60"
              >
                Kapat
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 rounded bg-[#222] text-white hover:bg-[#333] disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsList;
