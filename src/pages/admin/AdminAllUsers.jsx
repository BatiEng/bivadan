import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
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

const AdminAllUsers = () => {
  const { backendURL } = useContext(GlobalContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // server-side state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // filters/sort
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActivation, setIsActivation] = useState("");
  const [isConfirm, setIsConfirm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const [updatingKey, setUpdatingKey] = useState(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    role: "",
    identitynumber: "",
    is_activation: 0,
    is_confirm: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const allowedSorts = [
    "id",
    "name",
    "surname",
    "email",
    "phone",
    "role",
    "created_at",
    "is_activation",
    "is_confirm",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");

      const params = {
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        role: role || undefined,
        sort: allowedSorts.includes(sortBy) ? sortBy : "created_at",
        order,
      };
      if (isActivation !== "") params.is_activation = isActivation;
      if (isConfirm !== "") params.is_confirm = isConfirm;

      const res = await axios.get(`${backendURL}get_users.php`, { params });

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

  useEffect(() => {
    fetchData();
  }, [page, perPage, role, isActivation, isConfirm, sortBy, order]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
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

  const empty = !loading && rows.length === 0;

  const updateStatus = async (userId, patch) => {
    const keyName = `${userId}:${Object.keys(patch)[0]}`;
    setUpdatingKey(keyName);

    // optimistic UI
    const prev = rows.map((r) => ({ ...r }));
    setRows((rs) => rs.map((r) => (r.id === userId ? { ...r, ...patch } : r)));

    try {
      const res = await axios.post(
        `${backendURL}update_user_status.php`,
        {
          user_id: userId,
          ...patch,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Güncelleme başarısız.");
      }
      if (res.data?.data) {
        setRows((rs) =>
          rs.map((r) => (r.id === userId ? { ...r, ...res.data.data } : r))
        );
      }
    } catch (e) {
      setRows(prev);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Güncelleme yapılamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  // Row click -> open modal
  const openEdit = (u) => {
    setSaveErr("");
    setEditForm({
      id: u.id,
      name: u.name || "",
      surname: u.surname || "",
      email: u.email || "",
      phone: u.phone || "",
      address: u.address || "",
      city: u.city || "",
      role: u.role || "",
      identitynumber: u.identitynumber || "",
      is_activation: Number(u.is_activation) || 0,
      is_confirm: Number(u.is_confirm) || 0,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (!saving) setEditOpen(false);
  };

  const onEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((p) => ({
      ...p,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : name === "role"
          ? value
          : value,
    }));
  };

  const onSave = async () => {
    setSaveErr("");
    setSaving(true);
    try {
      const res = await axios.post(
        `${backendURL}update_user.php`,
        {
          user_id: editForm.id,
          name: editForm.name.trim(),
          surname: editForm.surname.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
          city: editForm.city.trim(),
          role: editForm.role,
          identitynumber: editForm.identitynumber.trim(),
          is_activation: Number(editForm.is_activation),
          is_confirm: Number(editForm.is_confirm),
        },
        { headers: { "Content-Type": "application/json" } }
      );
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
      setRows((rs) =>
        rs.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
      );
      setEditOpen(false);
    } catch (e) {
      setSaveErr(
        e?.response?.data?.errors ||
          e?.message ||
          "Kullanıcı güncellenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setSaving(false);
    }
  };

  // index number for table
  const rowIndex = (i) => (page - 1) * perPage + i + 1;

  return (
    <div className="flex min-h-screen">
      <VerticalNavbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Kullanıcılar
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
                placeholder="İsim, e‑posta, telefon, TC ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

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

            {/* Activation */}
            <select
              value={isActivation}
              onChange={(e) => {
                setIsActivation(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Aktivasyon (Tümü)</option>
              <option value="1">Aktif</option>
              <option value="0">Pasif</option>
            </select>

            {/* Confirm */}
            <select
              value={isConfirm}
              onChange={(e) => {
                setIsConfirm(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
            >
              <option value="">Onay (Tümü)</option>
              <option value="1">Onaylı</option>
              <option value="0">Onaysız</option>
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
                {headerCell("Ad", "name")}
                {headerCell("E‑posta", "email")}
                {headerCell("Telefon", "phone")}
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("id")}
                >
                  <div className="inline-flex items-center gap-1">
                    ID <SortIcon col="id" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("surname")}
                >
                  <div className="inline-flex items-center gap-1">
                    Soyad <SortIcon col="surname" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("role")}
                >
                  <div className="inline-flex items-center gap-1">
                    Rol <SortIcon col="role" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("is_activation")}
                >
                  <div className="inline-flex items-start gap-1 leading-4">
                    <span className="block">E‑posta</span>
                    <span className="block">Aktivasyon</span>
                    <SortIcon col="is_activation" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("is_confirm")}
                >
                  <div className="inline-flex items-center gap-1">
                    Onay <SortIcon col="is_confirm" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort("created_at")}
                >
                  <div className="inline-flex items-center gap-1">
                    Kayıt <SortIcon col="created_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    Yükleniyor…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((u, i) => {
                  const keyAct = `${u.id}:is_activation`;
                  const keyConf = `${u.id}:is_confirm`;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEdit(u)}
                    >
                      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
                        {rowIndex(i)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {u.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {u.phone}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {u.id}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {u.surname}
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 text-sm whitespace-nowrap">
                        <Badge
                          color={
                            u.role === "Admin"
                              ? "blue"
                              : u.role === "Garson"
                              ? "green"
                              : "yellow"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td
                        className="hidden sm:table-cell px-3 py-2 text-sm whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={String(u.is_activation) === "1"}
                            disabled={updatingKey === keyAct}
                            labelOn="Aktif"
                            labelOff="Pasif"
                            onChange={(next) =>
                              updateStatus(u.id, {
                                is_activation: next ? 1 : 0,
                              })
                            }
                          />
                          <span className="text-xs text-gray-600">
                            {String(u.is_activation) === "1"
                              ? "Aktif"
                              : "Pasif"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="hidden sm:table-cell px-3 py-2 text-sm whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={String(u.is_confirm) === "1"}
                            disabled={updatingKey === keyConf}
                            labelOn="Onaylı"
                            labelOff="Onaysız"
                            onChange={(next) =>
                              updateStatus(u.id, { is_confirm: next ? 1 : 0 })
                            }
                          />
                          <span className="text-xs text-gray-600">
                            {String(u.is_confirm) === "1"
                              ? "Onaylı"
                              : "Onaysız"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {u.created_at}
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
              <h3 className="text-lg font-semibold">Kullanıcıyı Düzenle</h3>
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
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ad
                  </label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Soyad
                  </label>
                  <input
                    name="surname"
                    value={editForm.surname}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    E‑posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Telefon
                  </label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Adres
                  </label>
                  <input
                    name="address"
                    value={editForm.address}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Şehir
                  </label>
                  <input
                    name="city"
                    value={editForm.city}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    TC Kimlik No
                  </label>
                  <input
                    name="identitynumber"
                    value={editForm.identitynumber}
                    onChange={onEditChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    E-posta Aktivasyon
                  </label>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={editForm.is_activation === 1}
                      onChange={(checked) =>
                        setEditForm((p) => ({
                          ...p,
                          is_activation: checked ? 1 : 0,
                        }))
                      }
                      labelOn="Aktif"
                      labelOff="Pasif"
                    />
                    <span className="text-xs text-gray-600">
                      {editForm.is_activation === 1 ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Onay
                  </label>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={editForm.is_confirm === 1}
                      onChange={(checked) =>
                        setEditForm((p) => ({
                          ...p,
                          is_confirm: checked ? 1 : 0,
                        }))
                      }
                      labelOn="Onaylı"
                      labelOff="Onaysız"
                    />
                    <span className="text-xs text-gray-600">
                      {editForm.is_confirm === 1 ? "Onaylı" : "Onaysız"}
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

export default AdminAllUsers;
