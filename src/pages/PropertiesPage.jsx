import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Image as ImageIcon,
  Film,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import PropertyDetailsModal from "../components/PropertyDetailsModal";
import { toast } from "react-toastify";

const PropertyCard = ({ p, isAuth }) => {
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

        <div className="text-xs text-gray-400">
          {p.layout_type} • {p.construction_year || "—"} •{" "}
          {new Date(p.created_at).toLocaleDateString()}
        </div>

        <button
          onClick={() => {
            if (isAuth) {
              setIsModalOpen(true);
            } else {
              console.log("User not authenticated");
              toast.info(
                "Bu işlemi gerçekleştirmek için giriş yapıp hesabınızı aktive etmeniz gerekmektedir .",
                { autoClose: 2000 }
              );
            }
          }}
          className="mt-3 w-full bg-[#B259AF] hover:bg-[#A14A9E] text-white px-4 py-2 rounded-lg  transition-colors text-sm cursor-pointer"
        >
          Detay
        </button>

        {isModalOpen && isAuth && (
          <PropertyDetailsModal
            is_show={false}
            propertyId={p.id}
            onClose={() => setIsModalOpen(false)}
            backendURL={backendURL}
          />
        )}
      </div>
    </div>
  );
};

const PropertiesPage = () => {
  const navigate = useNavigate();
  const { backendURL } = useContext(GlobalContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (stored) {
      try {
        const authUser = JSON.parse(stored);
        if (authUser.is_activation === "1" && authUser.is_confirm === "1") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (e) {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, [page, backendURL]);

  useEffect(() => {
    fetchProperties(page);
  }, []);

  const fetchProperties = async (p = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${backendURL}get_all_properties_active.php`,
        {
          params: {
            page: p,
            per_page: perPage,
            sort: "created_at",
            order: "desc",
          },
        }
      );

      if (res.data?.success) {
        setProperties(res.data.data || []);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setError(res.data?.message || "Properties could not be loaded.");
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Server error. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const show = (val, fallback = "—") =>
    val === null || val === undefined || String(val).trim() === ""
      ? fallback
      : val;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
                Tüm İlanlar
              </h1>
              <p className="text-gray-600 mt-1">
                Tüm mevcut ilanları görüntüleyin.
              </p>
            </div>
            <button
              onClick={() => navigate("/katil-ozel/emlak-ekle")}
              className="inline-flex items-center gap-2 bg-[#B259AF] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#A14A9E] transition-colors cursor-pointer"
            >
              İlan Ekle
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <div className="col-span-full text-center text-gray-500">
                Yükleniyor…
              </div>
            )}
            {!loading && properties.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                Henüz ilan yok.
              </div>
            )}
            {!loading &&
              properties.map((p) => (
                <PropertyCard isAuth={isAuthorized} key={p.id} p={p} />
              ))}
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

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
        </section>
      </main>
    </div>
  );
};

export default PropertiesPage;
