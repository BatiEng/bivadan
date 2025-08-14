import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import VerticalNavbar from "../../components/VerticalNavbar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Video,
  X,
  Edit2,
} from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Link } from "react-router-dom";

const Card = ({ p, onOpen }) => {
  const { backendURL } = useContext(GlobalContext);
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
      <div className="aspect-video bg-gray-100">
        {p.image ? (
          <img
            src={`${backendURL}${p.image}`}
            alt={p.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#1a1a1a] line-clamp-1">{p.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {p.description}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
          <span>Başlama: {p.start_date}</span>
          <span>Kayıt: {p.created_at?.slice(0, 10)}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            <ImageIcon size={14} /> {p.images_count || 0}
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            <Video size={14} /> {p.videos_count || 0}
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            <FileText size={14} /> {p.files_count || 0}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onOpen(p.id)}
            className="flex-1 text-center text-sm font-semibold text-white bg-[#222] hover:bg-[#333] rounded-lg py-2"
          >
            Detay
          </button>
          <Link
            to={`/admin/projeler/duzenle/${p.id}`}
            className="flex-1 text-center text-sm font-semibold text-white bg-[#B259AF] hover:bg-[#A14A9E] rounded-lg py-2"
          >
            Düzenle
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ open, onClose, data }) => {
  const { backendURL } = useContext(GlobalContext);
  if (!open) return null;
  const project = data?.project;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">{project?.title || "Proje"}</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <p className="text-sm text-gray-600">
              Başlama: {project?.start_date}
            </p>
            <p className="text-sm text-gray-600">
              Kayıt: {project?.created_at}
            </p>
            <p className="mt-3">{project?.description}</p>
          </div>

          {/* Images */}
          <div>
            <h4 className="font-semibold mb-2">Görseller</h4>
            {project?.images?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {project.images.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-lg overflow-hidden border"
                  >
                    <img
                      src={backendURL + img.image_path}
                      alt=""
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Görsel yok.</p>
            )}
          </div>

          {/* Videos */}
          <div>
            <h4 className="font-semibold mb-2">Videolar</h4>
            {project?.videos?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {project.videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="rounded-lg overflow-hidden border"
                  >
                    <video
                      src={backendURL + vid.video_path}
                      controls
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Video yok.</p>
            )}
          </div>

          {/* Files */}
          <div>
            <h4 className="font-semibold mb-2">Dosyalar</h4>
            {project?.files?.length ? (
              <ul className="space-y-2">
                {project.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between bg-gray-50 border rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm">{f.original_name}</span>
                    </div>
                    <a
                      href={backendURL + f.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#222] underline hover:text-[#444]"
                    >
                      Görüntüle/İndir
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Dosya yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const { backendURL } = useContext(GlobalContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  // Detail modal
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_projects.php`, {
        params: {
          page,
          per_page: perPage,
          search: search.trim() || undefined,
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
      setErr(e?.response?.data?.message || e.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${backendURL}get_projects.php`, {
        params: { include: "full", id },
      });
      if (res.data?.success) {
        setDetail(res.data.data);
      } else {
        setDetail(null);
      }
    } catch (e) {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchList();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="flex">
      <VerticalNavbar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Projeler</h1>
          <Link
            to="/admin/projeler/ekle"
            className="text-sm px-4 py-2 rounded-lg bg-[#222] text-white hover:bg-[#333]"
          >
            Yeni Proje
          </Link>
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
                placeholder="Başlık veya açıklama ara…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              />
            </div>

            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] md:ml-auto"
            >
              {[6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n}/sayfa
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-4 h-64 animate-pulse"
              />
            ))}

          {!loading && rows.length === 0 && (
            <div className="col-span-full text-center text-gray-500 bg-white rounded-xl p-10 border">
              Kayıt bulunamadı.
            </div>
          )}

          {!loading &&
            rows.map((p) => <Card key={p.id} p={p} onOpen={openDetail} />)}
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

      {/* Detail Modal */}
      <DetailModal open={open} onClose={() => setOpen(false)} data={detail} />
      {open && detailLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black/30 text-white px-4 py-2 rounded">
            Yükleniyor…
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
