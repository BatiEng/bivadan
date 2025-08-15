import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, Loader2, Send, FileText } from "lucide-react";

// This is a new component for the lightbox
const MediaLightbox = ({ mediaUrl, onClose, mediaType }) => {
  if (!mediaUrl) return null;

  const renderMedia = () => {
    if (mediaType === "video") {
      return (
        <video
          controls
          autoPlay
          className="max-h-full max-w-full rounded-2xl shadow-xl"
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <img
        src={mediaUrl}
        alt="Enlarged media"
        className="max-h-full max-w-full object-contain rounded-2xl shadow-xl"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center max-w-7xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking on the media
      >
        {renderMedia()}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800/50 hover:bg-gray-800/70 rounded-full p-2 transition-all duration-200"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const PropertyDetailsModal = ({ propertyId, onClose, backendURL, is_show }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  // New state for the media lightbox
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);

  const fetchDetails = async () => {
    try {
      setError(null);
      const res = await axios.get(`${backendURL}get_property_details.php`, {
        params: { id: propertyId },
      });
      if (res.data?.success) {
        setDetails(res.data.data);
      } else {
        throw new Error("Failed to fetch property details");
      }
    } catch (err) {
      setError("Unable to load property details");
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchDetails();
      // Add a class to the body to prevent scrolling when the modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Clean up the body class when the modal is closed
      document.body.style.overflow = "unset";
    };
  }, [propertyId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      await axios.post(`${backendURL}create_comment.php`, {
        property_id: propertyId,
        user_id: 1, // TODO: Replace with authenticated user ID
        comment: newComment,
      });
      setNewComment("");
      toast.success("Comment added successfully");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  if (!propertyId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {details?.title || "Emlak Detayları"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {loading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-center p-4">{error}</div>
            )}

            {details && !loading && (
              <>
                <p className="text-gray-600 mb-6">{details.description}</p>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Emlak Detayları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                    <p>
                      <strong>ID:</strong> {details.id}
                    </p>
                    <p>
                      <strong>Kullanıcı ID:</strong> {details.user_id}
                    </p>
                    <p>
                      <strong>Kategori:</strong> {details.property_category}
                    </p>
                    <p>
                      <strong>Oda:</strong> {details.layout_type}
                    </p>
                    <p>
                      <strong>Yapım yılı:</strong> {details.construction_year}
                    </p>
                    {is_show && (
                      <p>
                        <strong>Fiyat Aralığı:</strong> {details.min_price} -{" "}
                        {details.max_price} {details.currency}
                      </p>
                    )}
                    <p>
                      <strong>Şehir:</strong> {details.city}
                    </p>
                    <p>
                      <strong>Adres:</strong> {details.address}
                    </p>
                    <p>
                      <strong>Aktif:</strong> {details.is_active ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Eklenme tarihi:</strong>{" "}
                      {new Date(details.created_at).toLocaleString()}
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Sahip Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                    <p>
                      <strong>İsim:</strong> {details.owner_name}{" "}
                      {details.owner_surname}
                    </p>
                    <p>
                      <strong>Email:</strong> {details.owner_email}
                    </p>
                    <p>
                      <strong>Telefon:</strong> {details.owner_phone}
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Medya Galerisi
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {details.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200"
                      >
                        <img
                          src={backendURL + img.image_path}
                          alt={details.title}
                          className="w-full h-full object-cover"
                          onClick={() => {
                            setSelectedMedia(backendURL + img.image_path);
                            setSelectedMediaType("image");
                          }}
                        />
                      </div>
                    ))}
                    {details.videos.map((v) => (
                      <div
                        key={v.id}
                        className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => {
                          setSelectedMedia(backendURL + v.video_path);
                          setSelectedMediaType("video");
                        }}
                      >
                        <video
                          src={backendURL + v.video_path}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg group-hover:bg-black/60 transition-colors">
                          <span className="sr-only">Play video</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Dosyalar
                  </h3>
                  <div className="space-y-3">
                    {details.files.map((f) => (
                      <a
                        key={f.id}
                        href={backendURL + f.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-purple-600 hover:text-purple-700"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="truncate">
                          {f.file_path.split("/").pop()}
                        </span>
                      </a>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Değerlendirmeler
                  </h3>
                  <div className="space-y-4 mb-6">
                    {details.comments.map((c) => (
                      <div
                        key={c.id}
                        className="border-l-4 border-purple-300 pl-4 py-2 bg-gray-50 rounded-r-lg"
                      >
                        <div className="flex justify-between items-baseline">
                          <strong className="text-gray-800 text-sm">
                            {c.user_name} {c.user_surname}
                          </strong>
                          <span className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{c.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Teklif veya yorum ekle..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Gönder
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
      <MediaLightbox
        mediaUrl={selectedMedia}
        mediaType={selectedMediaType}
        onClose={() => setSelectedMedia(null)}
      />
    </>
  );
};

export default PropertyDetailsModal;
