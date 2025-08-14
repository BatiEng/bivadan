// src/pages/AdminMessages.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import VerticalNavbar from "../../components/VerticalNavbar";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Mail,
  X,
} from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";

const Toggle = ({
  checked,
  onChange,
  disabled = false,
  labelOn = "Tamamlandı",
  labelOff = "Bekliyor",
}) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition
      ${checked ? "bg-green-500" : "bg-orange-400"} ${
      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
    }`}
    aria-pressed={checked}
    title={checked ? labelOn : labelOff}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition
      ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

const AdminMessages = () => {
  const { backendURL } = useContext(GlobalContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // server
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // filters/sort
  const [search, setSearch] = useState("");
  const [isHandled, setIsHandled] = useState("0"); // varsayılan bekleyen
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  // modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // row‑level updating state
  const [updatingId, setUpdatingId] = useState(null);

  const allowedSorts = [
    "created_at",
    "name",
    "phone",
    "topic",
    "is_handled",
    "id",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const params = {
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        is_handled: isHandled === "" ? undefined : isHandled,
        sort: allowedSorts.includes(sortBy) ? sortBy : "created_at",
        order,
      };
      const res = await axios.get(`${backendURL}get_messages.php`, { params });
      if (res.data?.success) {
        setRows(res.data.data || []);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setErr(res.data?.message || "Mesajlar alınamadı.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); /* eslint-disable-next-line */
  }, [page, perPage, isHandled, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
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
      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none"
      onClick={() => toggleSort(colKey)}
    >
      <div className="inline-flex items-center gap-1">
        {label} <SortIcon col={colKey} />
      </div>
    </th>
  );

  const openModal = (row) => {
    setActive(row);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setActive(null);
  };

  // ---- NEW: durum toggle handler (optimistic)
  const updateStatus = async (rowId, nextHandled) => {
    setUpdatingId(rowId);
    const prev = rows.map((r) => ({ ...r }));
    setRows((rs) =>
      rs.map((r) =>
        r.id === rowId ? { ...r, is_handled: nextHandled ? 1 : 0 } : r
      )
    );

    try {
      const res = await axios.post(
        `${backendURL}update_message_status.php`,
        { id: rowId, is_handled: nextHandled ? 1 : 0 },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data?.success)
        throw new Error(res.data?.message || "Güncelleme başarısız.");
      // başarılı — isterseniz burada toast gösterebilirsiniz
    } catch (e) {
      // rollback
      setRows(prev);
      alert(
        e?.response?.data?.message || e?.message || "Güncelleme yapılamadı."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="p-6 flex-1 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Mesajlar</h1>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} /> Toplam: {rows.length}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Ad, telefon, konu, mesaj ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            <select
              value={isHandled}
              onChange={(e) => {
                setIsHandled(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="0">Bekleyen</option>
              <option value="1">Tamamlanan</option>
              <option value="">Tümü</option>
            </select>

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
                {headerCell("ID", "id")}
                {headerCell("Ad Soyad", "name")}
                {headerCell("Telefon", "phone")}
                {headerCell("Konu", "topic")}
                {headerCell("Mesaj", "message")}
                {headerCell("Durum", "is_handled")}
                {headerCell("Tarih", "created_at")}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-700">{m.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                      {m.name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {m.phone}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {m.topic || "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      <button
                        onClick={() => {
                          setActive(m);
                          setOpen(true);
                        }}
                        className="text-[#222] underline hover:text-[#444]"
                        title="Tamamını göster"
                      >
                        {(m.message || "").slice(0, 80)}
                        {(m.message || "").length > 80 ? "…" : ""}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Toggle
                          checked={Number(m.is_handled) === 1}
                          disabled={updatingId === m.id}
                          labelOn="Tamamlandı"
                          labelOff="Bekliyor"
                          onChange={(next) => updateStatus(m.id, next)}
                        />
                        <span className="text-xs text-gray-600">
                          {Number(m.is_handled) === 1
                            ? "Tamamlandı"
                            : "Bekliyor"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {m.created_at}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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
      </div>

      {/* Message Modal */}
      {open && active && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Mesaj Detayı</h3>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Ad Soyad:</span>{" "}
                  <span className="font-medium">{active.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Telefon:</span>{" "}
                  <span className="font-medium">{active.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Konu:</span>{" "}
                  <span className="font-medium">{active.topic || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tarih:</span>{" "}
                  <span className="font-medium">{active.created_at}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Mesaj</p>
                <div className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">
                  {active.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
