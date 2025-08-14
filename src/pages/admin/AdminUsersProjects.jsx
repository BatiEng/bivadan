import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FolderKanban,
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
    purple: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${map[color]}`}
    >
      {children}
    </span>
  );
};

export default function AdminUsersProjects() {
  const { backendURL } = useContext(GlobalContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // server params
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("approved"); // pending|approved|rejected|all
  const [role, setRole] = useState("");

  // sort (client)
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const allowedSorts = useMemo(
    () => ["created_at", "name", "projects_count"],
    []
  );

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
      onClick={() => toggleSort(colKey)}
      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
    >
      <div className="inline-flex items-center gap-1">
        {label} <SortIcon col={colKey} />
      </div>
    </th>
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_users_with_projects.php`, {
        params: {
          page,
          per_page: perPage,
          status, // default approved
          role: role || undefined,
          search: search.trim() || undefined,
        },
      });
      if (res.data?.success) {
        let data = res.data.data || [];
        // client sort
        data = [...data].sort((a, b) => {
          const dir = order === "asc" ? 1 : -1;
          if (sortBy === "name") {
            const an = `${a.name || ""} ${a.surname || ""}`;
            const bn = `${b.name || ""} ${b.surname || ""}`;
            return an.localeCompare(bn) * dir;
          }
          if (sortBy === "projects_count") {
            return ((a.projects_count || 0) - (b.projects_count || 0)) * dir;
          }
          // created_at
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
  }, [page, perPage, status, role, sortBy, order]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const statusColor = (s) =>
    s === "approved" ? "green" : s === "rejected" ? "red" : "yellow";

  const empty = !loading && rows.length === 0;

  return (
    <div className="flex min-h-screen">
      <VerticalNavbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
              Kullanıcılar & Katıldıkları Projeler
            </h1>
            <p className="text-sm text-gray-600">
              Hangi kullanıcı hangi projeye katılmış burada görebilirsiniz.
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
                placeholder="Kullanıcı veya proje ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="approved">Onaylı</option>
              <option value="pending">Bekliyor</option>
              <option value="rejected">Reddedildi</option>
              <option value="all">Tümü</option>
            </select>

            {/* Role */}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Tüm Roller</option>
              <option value="Admin">Admin</option>
              <option value="Garson">Garson</option>
              <option value="Kasiyer">Kasiyer</option>
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
                <th
                  scope="col"
                  onClick={() => toggleSort("created_at")}
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="inline-flex items-center gap-1">
                    Kayıt <SortIcon col="created_at" />
                  </div>
                </th>
                {headerCell("Kullanıcı", "name")}
                <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  İletişim
                </th>
                {headerCell("Projeler (Adet)", "projects_count")}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {empty && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 align-top">
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        {`${u.name || ""} ${u.surname || ""}`.trim() || "—"}
                      </div>
                      <div className="mt-1">
                        <Badge
                          color={
                            u.role === "Admin"
                              ? "blue"
                              : u.role === "Garson"
                              ? "green"
                              : "purple"
                          }
                        >
                          {u.role || "—"}
                        </Badge>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {u.email || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.phone || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <div className="mb-1 text-gray-700 font-medium">
                        {u.projects_count} proje
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(u.projects || []).slice(0, 6).map((p) => (
                          <span
                            key={p.project_id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100"
                          >
                            <FolderKanban size={12} className="text-gray-500" />
                            <span className="truncate max-w-[120px] sm:max-w-[180px]">
                              {p.project_title || `#${p.project_id}`}
                            </span>
                            <Badge color={statusColor(p.status)}>
                              {p.status}
                            </Badge>
                          </span>
                        ))}
                        {u.projects_count > 6 && (
                          <span className="text-xs text-gray-500">
                            +{u.projects_count - 6} daha
                          </span>
                        )}
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
