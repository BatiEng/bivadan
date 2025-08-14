import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useNavigate, useParams } from "react-router-dom";
import { X, Image as ImageIcon, Video, FileText, Trash2 } from "lucide-react";
import VerticalNavbar from "../../components/VerticalNavbar";
import { toast } from "react-toastify";

const AdminEditProject = () => {
  const { backendURL } = useContext(GlobalContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteMedia, setDeleteMedia] = useState({
    images: [],
    videos: [],
    files: [],
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendURL}get_projects.php`, {
          params: { include: "full", id },
        });
        if (res.data?.success) {
          const project = res.data.data?.project;
          setFormData({
            title: project.title || "",
            description: project.description || "",
            start_date: project.start_date || "",
          });
          setImages(project.images || []);
          setVideos(project.videos || []);
          setFiles(project.files || []);
        } else {
          setError(res.data?.message || "Proje yüklenemedi.");
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Sunucu hatası.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [backendURL, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e,
    setFunc,
    maxItems,
    currentItems,
    maxSizeMB = Infinity
  ) => {
    const files = Array.from(e.target.files);
    if (files.length + currentItems.length > maxItems) {
      setError(`En fazla ${maxItems} dosya ekleyebilirsiniz.`);
      return;
    }
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Her dosya ${maxSizeMB}MB boyutunu aşamaz.`);
        return;
      }
    }
    setFunc((prev) => [...prev, ...files]);
  };

  const handleDeleteNewMedia = (type, index) => {
    if (type === "images") {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "videos") {
      setNewVideos((prev) => prev.filter((_, i) => i !== index));
    } else if (type === "files") {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteMedia = (type, id) => {
    setDeleteMedia((prev) => ({
      ...prev,
      [type]: [...prev[type], id],
    }));
    if (type === "images")
      setImages((prev) => prev.filter((img) => img.id !== id));
    if (type === "videos")
      setVideos((prev) => prev.filter((vid) => vid.id !== id));
    if (type === "files")
      setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("start_date", formData.start_date);
    data.append("delete_images", JSON.stringify(deleteMedia.images));
    data.append("delete_videos", JSON.stringify(deleteMedia.videos));
    data.append("delete_files", JSON.stringify(deleteMedia.files));

    newImages.forEach((img) => data.append("images[]", img));
    newVideos.forEach((vid) => data.append("videos[]", vid));
    newFiles.forEach((file) => data.append("files[]", file));

    try {
      const res = await axios.post(
        `${backendURL}update_project.php?id=${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.success) {
        toast.success("Proje başarıyla güncellendi.");
        navigate("/admin/projeler");
      } else {
        setError(res.data.message || "Proje güncellenemedi.");
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VerticalNavbar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Proje Düzenle</h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 animate-fade-in">
            {error}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Başlık
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition duration-200"
                rows="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Başlama Tarihi
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition duration-200"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Görseller
              </label>
              <p className="text-sm text-gray-500 mb-3">
                En fazla 10 resim eklenebilir
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <img
                      src={`${backendURL}${img.image_path}`}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia("images", img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {newImages.map((img, index) => (
                  <div
                    key={`new-image-${index}`}
                    className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={img.name}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNewMedia("images", index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <ImageIcon size={18} className="text-gray-600" />
                Görsel Yükle
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, setNewImages, 10, images)
                  }
                  className="hidden"
                />
              </label>
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Videolar
              </label>
              <p className="text-sm text-gray-500 mb-3">
                En fazla 5 video yüklenebilir, videoların boyutu tane başına
                50MB geçemez
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <video
                      src={`${backendURL}${vid.video_path}`}
                      controls
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia("videos", vid.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {newVideos.map((vid, index) => (
                  <div
                    key={`new-video-${index}`}
                    className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <video
                      src={URL.createObjectURL(vid)}
                      controls
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNewMedia("videos", index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <Video size={18} className="text-gray-600" />
                Video Yükle
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) =>
                    handleFileChange(e, setNewVideos, 5, videos, 50)
                  }
                  className="hidden"
                />
              </label>
            </div>

            {/* Files */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dosyalar
              </label>
              <ul className="space-y-3 mt-3">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {file.original_name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia("files", file.id)}
                      className="text-red-500 hover:text-red-600 transition duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
                {newFiles.map((file, index) => (
                  <li
                    key={`new-file-${index}`}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNewMedia("files", index)}
                      className="text-red-500 hover:text-red-600 transition duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <FileText size={18} className="text-gray-600" />
                Dosya Yükle
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                  onChange={(e) => handleFileChange(e, setNewFiles, 10, files)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-[#B259AF] hover:bg-[#A14A9E] text-white rounded-lg  transition duration-200 disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/projeler")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProject;
