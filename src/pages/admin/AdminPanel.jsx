// src/pages/AdminPanel.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import VerticalNavbar from "../../components/VerticalNavbar";
import { FolderPlus, Users, Mail, BarChart3, AlertCircle } from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <Icon size={32} className={color} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow p-5 h-[84px] animate-pulse" />
  );
}

function ListItem({ title, meta, right }) {
  return (
    <li className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {meta && <p className="text-xs text-gray-500">{meta}</p>}
      </div>
      {right}
    </li>
  );
}

function AdminPanel() {
  const { backendURL } = useContext(GlobalContext);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_admin_dashboard.php`);
      if (res.data?.success) setData(res.data.data);
      else setErr(res.data?.message || "Veri alınamadı.");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Optionally auto-refresh every 60s:
    // const t = setInterval(fetchDashboard, 60000);
    // return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Yönetim Paneli</h1>
            <p className="text-gray-500">
              Hoş geldiniz! Buradan tüm sistem ayarlarını yönetebilirsiniz.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            Yenile
          </button>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5" />
            <div>{err}</div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                icon={BarChart3}
                label="Toplam Proje"
                value={data?.project_count ?? "-"}
                color="text-indigo-500"
              />
              <StatCard
                icon={Users}
                label="Toplam Kullanıcı"
                value={data?.user_count ?? "-"}
                color="text-green-500"
              />
              <StatCard
                icon={Mail}
                label="Gelen Mesajlar (Bekleyen)"
                value={data?.pending_messages ?? "-"}
                color="text-orange-500"
              />
              <StatCard
                icon={FolderPlus}
                label="Bekleyen Onaylar"
                value={data?.pending_approvals ?? "-"}
                color="text-blue-500"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/admin/projeler/ekle"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-xl shadow flex flex-col items-center gap-3 transition"
            >
              <FolderPlus size={28} />
              <span>Proje Ekle</span>
            </Link>
            <Link
              to="/admin/kullanicilar"
              className="bg-green-600 hover:bg-green-700 text-white p-5 rounded-xl shadow flex flex-col items-center gap-3 transition"
            >
              <Users size={28} />
              <span>Kullanıcıları Gör</span>
            </Link>
            <Link
              to="/admin/mesajlar"
              className="bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-xl shadow flex flex-col items-center gap-3 transition"
            >
              <Mail size={28} />
              <span>Mesajları Gör</span>
            </Link>
          </div>
        </div>

        {/* Latest Pending Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Messages */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Bekleyen Mesajlar</h3>
              <Link
                to="/admin/mesajlar"
                className="text-sm text-[#222] underline hover:text-[#444]"
              >
                Tümü
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
              </div>
            ) : data?.latest_pending_messages?.length ? (
              <ul className="divide-y divide-gray-100">
                {data.latest_pending_messages.map((m) => (
                  <ListItem
                    key={m.id}
                    title={`${m.name} • ${m.topic || "Konu yok"}`}
                    meta={`${m.phone || "-"} • ${m.created_at}`}
                    right={
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                        Bekliyor
                      </span>
                    }
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Bekleyen mesaj yok.</p>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Bekleyen Onaylar</h3>
              <Link
                to="/admin/kullanicilar"
                className="text-sm text-[#222] underline hover:text-[#444]"
              >
                Tümü
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
                <div className="h-12 bg-gray-100 animate-pulse rounded" />
              </div>
            ) : data?.latest_pending_approvals?.length ? (
              <ul className="divide-y divide-gray-100">
                {data.latest_pending_approvals.map((u) => (
                  <ListItem
                    key={u.id}
                    title={`${u.name} ${u.surname} • ${u.email}`}
                    meta={`Rol: ${u.role} • Kayıt: ${u.created_at}`}
                    right={
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                        Onay Bekliyor
                      </span>
                    }
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Bekleyen onay yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
