import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import VerticalNavbar from "../../components/VerticalNavbar";
import { GlobalContext } from "../../contexts/GlobalContext";

const Badge = ({ children, color = "gray" }) => {
  const map = {
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${map[color]}`}
    >
      {children}
    </span>
  );
};

export default function AdminProjectRequest() {
  const { backendURL } = useContext(GlobalContext);

  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // server state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending"); // pending|approved|rejected|all

  // sorting (client-side minimal; server already returns by created_at desc)
  const [sortKey, setSortKey] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const allowedSorts = useMemo(
    () => ["created_at", "project_title", "user_name"],
    []
  );

  // inline update locks
  const [busyId, setBusyId] = useState(null);

  const toggleSort = (key) => {
    if (!allowedSorts.includes(key)) return;
    if (sortKey === key) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setOrder("asc");
    }
  };
  const SortIcon = ({ col }) =>
    sortKey === col ? (
      order === "asc" ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : null;

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(
        `${backendURL}get_participation_requests.php`,
        {
          params: {
            page,
            per_page: perPage,
            status,
            search: search.trim() || undefined,
          },
        }
      );
      if (res.data?.success) {
        let data = res.data.data || [];
        // optional client sort
        data = [...data].sort((a, b) => {
          const dir = order === "asc" ? 1 : -1;
          if (sortKey === "project_title") {
            return a.project_title?.localeCompare(b.project_title || "") * dir;
          }
          if (sortKey === "user_name") {
            const an = `${a.user_name || ""} ${a.user_surname || ""}`;
            const bn = `${b.user_name || ""} ${b.user_surname || ""}`;
            return an.localeCompare(bn) * dir;
          }
          // default created_at
          return (new Date(a.created_at) - new Date(b.created_at)) * dir;
        });

        setRows(data);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setErr(res.data?.message || "Kayıtlar alınamadı.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, status, sortKey, order]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const act = async (rowId, newStatus) => {
    if (busyId) return;
    const confirmMsg =
      newStatus === "approved"
        ? "Bu kullanıcıyı projeye kabul etmek istediğinize emin misiniz?"
        : "Bu katılım isteğini REDDETMEK istediğinize emin misiniz?";
    if (!window.confirm(confirmMsg)) return;

    // optional note
    let note = null;
    if (newStatus === "rejected") {
      note = window.prompt("Red notu (opsiyonel):", "") || null;
    }

    try {
      setBusyId(rowId);
      const prev = [...rows];
      // optimistic
      setRows((rs) =>
        rs.map((r) => (r.id === rowId ? { ...r, status: newStatus } : r))
      );

      const res = await axios.post(
        `${backendURL}update_participation_status.php`,
        { participant_id: rowId, status: newStatus, note },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Güncelleme başarısız.");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Güncelleme hatası.");
      // refresh list to be safe
      fetchData();
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (s) => {
    if (s === "approved") return <Badge color="green">Onaylı</Badge>;
    if (s === "rejected") return <Badge color="red">Reddedildi</Badge>;
    return <Badge color="yellow">Bekliyor</Badge>;
  };

  const headerCell = (label, key) => (
    <th
      scope="col"
      onClick={() => toggleSort(key)}
      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
    >
      <div className="inline-flex items-center gap-1">
        {label} <SortIcon col={key} />
      </div>
    </th>
  );

  return (
    <div className="flex min-h-screen">
      <VerticalNavbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
              Proje Katılım İstekleri
            </h1>
            <p className="text-sm text-gray-600">
              Bekleyen/Onaylanan/Reddedilen tüm istekleri buradan yönetin.
            </p>
          </div>
        </div>

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
                placeholder="Kullanıcı adı/e‑posta veya proje başlığı ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            {/* Status */}
            <div className="inline-flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              >
                <option value="pending">Bekliyor</option>
                <option value="approved">Onaylı</option>
                <option value="rejected">Reddedildi</option>
                <option value="all">Tümü</option>
              </select>
            </div>

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
                <th
                  scope="col"
                  onClick={() => toggleSort("created_at")}
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="inline-flex items-center gap-1">
                    Tarih <SortIcon col="created_at" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Durum
                </th>
                {headerCell("Proje", "project_title")}
                {headerCell("Kullanıcı", "user_name")}
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm whitespace-nowrap">
                      {r.status === "pending" && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} className="text-yellow-600" />
                          {statusBadge(r.status)}
                        </span>
                      )}
                      {r.status === "approved" && (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-green-600" />
                          {statusBadge(r.status)}
                        </span>
                      )}
                      {r.status === "rejected" && (
                        <span className="inline-flex items-center gap-1">
                          <XCircle size={14} className="text-red-600" />
                          {statusBadge(r.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {r.project_title || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {`${r.user_name || ""} ${r.user_surname || ""}`.trim() ||
                        "—"}
                      <div className="text-xs text-gray-400">
                        {r.user_email}
                      </div>
                      {r.user_phone && (
                        <div className="text-xs text-gray-400">
                          {r.user_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={busyId === r.id || r.status === "approved"}
                          onClick={() => act(r.id, "approved")}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          title="Onayla"
                        >
                          <CheckCircle2 size={16} />
                          <span className="hidden sm:inline">Onayla</span>
                        </button>
                        <button
                          disabled={busyId === r.id || r.status === "rejected"}
                          onClick={() => act(r.id, "rejected")}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          title="Reddet"
                        >
                          <XCircle size={16} />
                          <span className="hidden sm:inline">Reddet</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
