import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProjectItem from "../components/ProjectItem";
import { GlobalContext } from "../contexts/GlobalContext";
import { FileText, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendURL } = useContext(GlobalContext);

  const [projectData, setProjectData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [otherProjects, setOtherProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image modal

  const [partStatus, setPartStatus] = useState("none"); // none | pending | approved | rejected
  const [joining, setJoining] = useState(false);
  const user =
    JSON.parse(localStorage.getItem("authUser")) ||
    JSON.parse(sessionStorage.getItem("authUser")) ||
    null;

  const isAdmin = user?.role === "Admin";
  const isApproved = isAdmin || partStatus === "approved";

  const fetchProject = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${backendURL}get_project_by_id.php`, {
        params: { id },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Proje bulunamadı.");
      }

      const data = res.data.data;
      setProjectData(data);

      const cover =
        (data.images?.[0]?.image_path &&
          `${backendURL}${data.images[0].image_path}`) ||
        "";
      setMainImage(cover);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOther = async () => {
    try {
      const res = await axios.get(`${backendURL}get_projects.php`, {
        params: { per_page: 6, sort: "created_at", order: "desc" },
      });
      if (res.data?.success) {
        const list = (res.data.data || []).filter(
          (p) => Number(p.id) !== Number(id)
        );
        setOtherProjects(list);
      }
    } catch {
      /* non-blocking */
    }
  };

  const fetchParticipation = async () => {
    if (!user?.id) return setPartStatus("none");
    try {
      const resp = await axios.get(`${backendURL}check_participation.php`, {
        params: { project_id: id, user_id: user.id },
      });
      if (resp.data?.success) {
        setPartStatus(resp.data?.data?.status || "none");
      } else {
        setPartStatus("none");
      }
    } catch {
      setPartStatus("none");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProject();
    fetchOther();
    fetchParticipation();
  }, [id, backendURL]);

  const sendJoinRequest = async () => {
    if (!user) {
      navigate("/uye-girisi");
      return;
    }
    if (partStatus === "pending" || partStatus === "approved") return;
    try {
      setJoining(true);
      const resp = await axios.post(
        `${backendURL}request_join_project.php`,
        { project_id: id, user_id: user.id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (resp.data?.success) {
        setPartStatus("pending");
        toast.success(
          "Katılma isteğiniz gönderildi. Onaylandığında bildireceğiz."
        );
      } else {
        toast.error(resp.data?.message || "İstek gönderilemedi.");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Sunucu hatası.");
    } finally {
      setJoining(false);
    }
  };

  const images = useMemo(() => projectData?.images || [], [projectData]);
  const videos = useMemo(() => projectData?.videos || [], [projectData]);
  const files = useMemo(() => projectData?.files || [], [projectData]);
  const project = projectData?.project;

  const openImageModal = (src) => {
    setEnlargedImage(src);
  };

  const closeImageModal = () => {
    setEnlargedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Yükleniyor…
      </div>
    );
  }

  if (err || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {err || "Proje bulunamadı."}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header image + title */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
          <div className="relative">
            {mainImage ? (
              <img
                src={mainImage}
                alt={project.title}
                className="w-full h-[420px] object-cover cursor-pointer"
                onClick={() => openImageModal(mainImage)}
              />
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 text-gray-400">
                Görsel yok
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img) => {
                const src = `${backendURL}${img.image_path}`;
                const active = src === mainImage;
                return (
                  <img
                    key={img.id}
                    src={src}
                    alt={`${project.title} küçük görsel`}
                    onClick={() => {
                      setMainImage(src);
                      openImageModal(src);
                    }}
                    className={`h-24 w-36 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      active
                        ? "border-gray-600 shadow"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Image Modal */}
        {enlargedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img
                src={enlargedImage}
                alt="Enlarged project image"
                className="w-full h-full object-contain"
              />
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
                aria-label="Görseli kapat"
              >
                <X size={24} className="text-[#222]" />
              </button>
            </div>
          </div>
        )}

        {/* Açıklama */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Proje Detayları
          </h2>
          <p className="text-gray-700 leading-relaxed">{project.description}</p>
        </div>

        {/* Katılma / Katılımcıya Özel */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Katılımcı Alanı
            </h2>

            {!user ? (
              <button
                onClick={() => navigate("/uye-girisi")}
                className="px-4 py-2 rounded-lg bg-[#222] text-white hover:bg-[#333]"
              >
                Giriş Yap & Katıl
              </button>
            ) : partStatus === "approved" || isAdmin ? (
              <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                Bu projeye katıldınız
              </span>
            ) : partStatus === "pending" ? (
              <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                Katılma isteğiniz onay bekliyor
              </span>
            ) : (
              <button
                disabled={joining}
                onClick={sendJoinRequest}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {joining ? "Gönderiliyor…" : "Katılma İsteği Gönder"}
              </button>
            )}
          </div>

          {isApproved ? (
            <>
              <div className="text-gray-700 space-y-2">
                <div>
                  <span className="font-semibold">Başlangıç Tarihi:</span>{" "}
                  <span>{project.start_date}</span>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Proje Dosyaları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map((f) => (
                      <a
                        key={f.id}
                        href={`${backendURL}${f.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <FileText size={18} className="text-indigo-600" />
                        <span className="truncate">
                          {f.original_name || "Proje Dosyası"}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">
              Proje dosyaları ve ayrıntılar katılımcılara özeldir. Katılma
              isteği göndererek erişim talep edebilirsiniz.
            </p>
          )}
        </div>

        {/* Videolar */}
        {videos.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Videolar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <video
                  key={v.id}
                  controls
                  className="w-full rounded-lg overflow-hidden bg-black"
                  src={`${backendURL}${v.video_path}`}
                >
                  Tarayıcınız video etiketini desteklemiyor.
                </video>
              ))}
            </div>
          </div>
        )}

        {/* Diğer Projeler */}
        {otherProjects.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Diğer Projelerimiz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((p) => (
                <ProjectItem
                  key={p.id}
                  project={{
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    image: p.image ? `${p.image}` : "",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetail;
