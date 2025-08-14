import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";
import VerticalNavbar from "../../components/VerticalNavbar";
import PropertyDetailsModal from "../../components/PropertyDetailsModal";

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

const AdminBivadanAlSat = () => {
  const { backendURL } = useContext(GlobalContext);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [toggleLoading, setToggleLoading] = useState({}); // Track loading state for each toggle

  // Server params
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [isActive, setIsActive] = useState(""); // "", "0", "1"
  const [ownerRole, setOwnerRole] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc"); // asc|desc
  const allowedSorts = useMemo(
    () => [
      "created_at",
      "title",
      "city",
      "min_price",
      "max_price",
      "construction_year",
      "layout_type",
    ],
    []
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const params = {
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        city: city || undefined,
        sort: allowedSorts.includes(sortBy) ? sortBy : "created_at",
        order,
      };
      if (isActive !== "") params.is_active = isActive;
      if (ownerRole) params.role = ownerRole;

      const res = await axios.get(`${backendURL}get_all_properties.php`, {
        params,
      });
      if (res.data?.success) {
        setRows(res.data.data || []);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setErr(res.data?.message || "Kayıtlar alınamadı.");
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle is_active for a property
  const toggleActive = async (propertyId, currentStatus) => {
    try {
      setToggleLoading((prev) => ({ ...prev, [propertyId]: true }));
      setErr("");
      const newStatus = currentStatus === "1" ? 0 : 1;
      const res = await axios.post(`${backendURL}toggle_property_active.php`, {
        id: propertyId,
        is_active: newStatus,
      });
      if (res.data?.success) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === propertyId ? { ...row, is_active: newStatus } : row
          )
        );
      } else {
        setErr(res.data?.message || "Durum güncellenemedi.");
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setToggleLoading((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line
  }, [page, perPage, city, isActive, ownerRole, sortBy, order]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const headerCell = (label, colKey, extra = "") => (
    <th
      scope="col"
      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none ${extra}`}
      onClick={() => toggleSort(colKey)}
    >
      <div className="inline-flex items-center gap-1">
        {label} <SortIcon col={colKey} />
      </div>
    </th>
  );

  const empty = !loading && rows.length === 0;

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="p-4 flex-1">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Bivadan Al/Sat — İlanlar
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search */}
            <div className="relative md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Başlık, açıklama, şehir, kullanıcı e‑posta/isim ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            {/* City */}
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="Şehir"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            />

            {/* Active */}
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Durum (Tümü)</option>
              <option value="1">Aktif</option>
              <option value="0">Pasif</option>
            </select>

            {/* Owner Role */}
            <select
              value={ownerRole}
              onChange={(e) => {
                setOwnerRole(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Sahip Rol (Tümü)</option>
              <option value="Admin">Admin</option>
              <option value="Garson">Garson</option>
              <option value="Kasiyer">Kasiyer</option>
            </select>

            {/* Per Page */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] md:ml-auto"
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
                {headerCell("ID", "created_at")}
                {headerCell("Kapak", "created_at")}
                {headerCell("Başlık", "title")}
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Sahip
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Rol
                </th>
                {headerCell("Şehir", "city", "hidden sm:table-cell")}
                {headerCell("Tip", "layout_type", "hidden sm:table-cell")}
                {headerCell("Yıl", "construction_year", "hidden sm:table-cell")}
                {headerCell("Min ₺", "min_price", "hidden sm:table-cell")}
                {headerCell("Max ₺", "max_price", "hidden sm:table-cell")}
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Durum
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Medya
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Oluşturma
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap"
                >
                  Detay
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={14} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {empty && (
                <tr>
                  <td colSpan={14} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-12 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {r.cover_image ? (
                          <img
                            src={backendURL + r.cover_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {r.title ||
                        `${r.layout_type || ""} ${r.city ? "• " + r.city : ""}`}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {`${r.owner_name || ""} ${
                        r.owner_surname || ""
                      }`.trim() || "—"}
                      <div className="text-xs text-gray-400">
                        {r.owner_email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.owner_phone}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm">
                      <Badge
                        color={
                          r.owner_role === "Admin"
                            ? "blue"
                            : r.owner_role === "Garson"
                            ? "green"
                            : "yellow"
                        }
                      >
                        {r.owner_role || "—"}
                      </Badge>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.city || "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.layout_type || "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.construction_year || "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.min_price != null
                        ? Number(r.min_price).toLocaleString()
                        : "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.max_price != null
                        ? Number(r.max_price).toLocaleString()
                        : "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm">
                      <button
                        onClick={() => toggleActive(r.id, r.is_active)}
                        disabled={toggleLoading[r.id]}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${
                          r.is_active === "1" ? "bg-green-500" : "bg-red-500"
                        } ${
                          toggleLoading[r.id]
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 bg-white rounded-full transform transition-transform duration-200 ease-in-out ${
                            r.is_active === "1"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                        {toggleLoading[r.id] && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                              ></path>
                            </svg>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.images_count || 0} görsel • {r.videos_count || 0} video
                      • {r.files_count || 0} dosya
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPropertyId(r.id)}
                        className="text-blue-600 underline"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {selectedPropertyId && (
          <PropertyDetailsModal
            propertyId={selectedPropertyId}
            onClose={() => setSelectedPropertyId(null)}
            backendURL={backendURL}
          />
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
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
    </div>
  );
};

export default AdminBivadanAlSat;
