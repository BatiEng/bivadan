// src/pages/Projects.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ProjectItem from "../components/ProjectItem";
import { GlobalContext } from "../contexts/GlobalContext";

const Projects = () => {
  const { backendURL } = useContext(GlobalContext); // e.g. https://domain.com/api/
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // server-side state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_projects.php`, {
        params: {
          page,
          per_page: perPage,
          search: searchQuery.trim() || undefined,
          sort: "created_at",
          order: "desc",
        },
      });
      if (res.data?.success) {
        setRows(res.data.data || []);
        setTotalPages(res.data?.pagination?.total_pages || 1);
      } else {
        setErr(res.data?.message || "Projeler alınamadı.");
      }
    } catch (e) {
      setErr(
        e?.response?.data?.errors?.[0] ||
          e?.response?.data?.message ||
          e.message ||
          "Sunucu hatası."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // fetch on paging
  useEffect(() => {
    fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // fallback image if needed
  const withImage = useMemo(
    () =>
      (rows || []).map((p) => ({
        ...p,
        image: p.cover_image || p.image || "/placeholder.jpg",
      })),
    [rows]
  );

  return (
    <div className="flex flex-col">
      <Navbar />
      <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Search Bar */}
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-6 tracking-tight">
              Tüm Projelerimiz
            </h2>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                aria-label="Projeleri ara"
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Error */}
          {err && (
            <div className="max-w-3xl mx-auto mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {err}
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-white rounded-xl shadow animate-pulse"
                />
              ))
            ) : withImage.length > 0 ? (
              withImage.map((project) => (
                <ProjectItem key={project.id} project={project} />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                Aramanıza uygun proje bulunamadı.
              </p>
            )}
          </div>

          {/* Pagination + per page */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10">
            <div className="text-sm text-gray-600">
              Sayfa {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              >
                {[6, 12, 24, 48].map((n) => (
                  <option key={n} value={n}>
                    {n}/sayfa
                  </option>
                ))}
              </select>
              <button
                className="inline-flex items-center gap-1 px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 cursor-pointer"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo(0, 0);
                }}
              >
                <ChevronLeft size={16} /> Geri
              </button>
              <button
                className="inline-flex items-center gap-1 px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 cursor-pointer"
                disabled={page >= totalPages || loading}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo(0, 0);
                }}
              >
                İleri <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
