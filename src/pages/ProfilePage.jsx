import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Phone,
  Shield,
  IdCard,
  MapPin,
  Calendar,
  LogOut,
  Image as ImageIcon,
  Film,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import PropertyDetailsModal from "../components/PropertyDetailsModal"; // Assuming this path
import PropertyEditModal from "../components/PropertyEditModal";

const PropertyCard = ({ p, fetch }) => {
  const { backendURL } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const price =
    p.min_price && p.max_price
      ? `${Number(p.min_price).toLocaleString()} - ${Number(
          p.max_price
        ).toLocaleString()} ${p.currency || ""}`
      : p.min_price
      ? `${Number(p.min_price).toLocaleString()} ${p.currency || ""}`
      : p.max_price
      ? `${Number(p.max_price).toLocaleString()} ${p.currency || ""}`
      : "—";

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="relative h-40 bg-gray-100">
        {p.cover_image ? (
          <img
            src={backendURL + p.cover_image}
            alt={p.title || p.layout_type}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={28} />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full ${
            String(p.is_active) === "1"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {String(p.is_active) === "1" ? "Aktif" : "Pasif"}
        </span>
      </div>

      <div className="p-4 space-y-1">
        <div className="text-sm text-gray-500">{p.city}</div>
        <h3 className="text-lg font-semibold text-[#1a1a1a]">
          {p.title || `${p.layout_type} • ${p.city}`}
        </h3>
        <div className="text-sm text-gray-600 truncate-2">{p.description}</div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="inline-flex items-center gap-1">
            <ImageIcon size={14} /> {p.images_count || 0}
          </div>
          <div className="inline-flex items-center gap-1">
            <Film size={14} /> {p.videos_count || 0}
          </div>
          <div className="inline-flex items-center gap-1">
            <FileText size={14} /> {p.files_count || 0}
          </div>
        </div>

        <div className="mt-2 text-sm font-medium text-gray-800">{price}</div>
        <div className="text-xs text-gray-400">
          {p.layout_type} • {p.construction_year || "—"} •{" "}
          {new Date(p.created_at).toLocaleDateString()}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 w-full bg-[#B259AF] hover:bg-[#A14A9E]  text-white px-4 py-2 rounded-lg  transition-colors text-sm"
        >
          Detay
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-2 w-full bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          Düzenle
        </button>
        {isModalOpen && (
          <PropertyEditModal
            fetch={fetch}
            close={() => setIsModalOpen(false)}
            backendURL={backendURL}
            propertyId={p.id}
            user={
              JSON.parse(localStorage.getItem("authUser")) ||
              JSON.parse(sessionStorage.getItem("authUser"))
            }
            onClose={() => setIsModalOpen(false)}
            onSaved={(updated) => {
              // optional: update the card data quickly
              if (updated) {
                // updated: { id, title, city, layout_type, min_price, max_price, currency, is_active, cover_image }
                // trigger a parent refresh as needed; simplest: window.location reload or refetch list
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { backendURL } = useContext(GlobalContext);
  const [user, setUser] = useState(null);

  // properties
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Load auth user
  useEffect(() => {
    const stored =
      localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (!stored) {
      navigate("/uye-girisi");
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUser(u);
    } catch {
      handleLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("authUser");
    } finally {
      navigate("/uye-girisi");
    }
  };

  // Fetch user properties
  const fetchProps = async (uid, p = 1) => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_user_properties.php`, {
        params: {
          user_id: uid,
          page: p,
          per_page: perPage,
          sort: "created_at",
          order: "desc",
        },
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

  useEffect(() => {
    if (user?.id) fetchProps(user.id, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  if (!user) return null;

  const show = (val, fallback = "—") =>
    val === null || val === undefined || String(val).trim() === ""
      ? fallback
      : val;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
                Profilim
              </h1>
              <p className="text-gray-600 mt-1">
                Hesap bilgilerinizi görüntüleyin.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-[#B259AF] hover:bg-[#A14A9E]  text-white px-4 py-2 rounded-lg text-sm font-semibold  transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              Çıkış Yap
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={28} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a]">
                    {show(
                      `${user.name || ""} ${user.surname || ""}`.trim(),
                      "Kullanıcı"
                    )}
                  </h2>
                </div>
              </div>

              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={16} />
                <span>Üyelik: {show(user.created_at)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <Mail className="text-gray-500 mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    E‑posta
                  </p>
                  <p className="text-[#1a1a1a] font-medium">
                    {show(user.email)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-gray-500 mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Telefon
                  </p>
                  <p className="text-[#1a1a1a] font-medium">
                    {show(user.phone)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IdCard className="text-gray-500 mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    TC Kimlik No
                  </p>
                  <p className="text-[#1a1a1a] font-medium">
                    {show(user.identitynumber)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-1">
                <MapPin className="text-gray-500 mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Adres
                  </p>
                  <p className="text-[#1a1a1a] font-medium">
                    {show(user.address)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Properties */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              İlanlarım
            </h2>
            <p className="text-sm text-gray-600">
              Toplam {rows.length} kayıt (sayfa {page} / {totalPages})
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <div className="col-span-full text-center text-gray-500">
                Yükleniyor…
              </div>
            )}
            {!loading && rows.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                Henüz ilanınız yok.
              </div>
            )}
            {!loading &&
              rows.map((p) => (
                <PropertyCard fetch={fetchProps} key={p.id} p={p} />
              ))}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
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
          )}

          {err && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {err}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
