import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { GlobalContext } from "../contexts/GlobalContext";
import { motion, AnimatePresence } from "framer-motion";

const NewsSection = () => {
  const { backendURL } = useContext(GlobalContext);
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const autoScrollRef = useRef(null);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${backendURL}get_news.php`);
      if (res.data.success) {
        const activeNews = res.data.data.filter((n) => n.is_active === "1");
        setNews(activeNews);
        if (activeNews.length === 0) {
          setError("Aktif haber bulunamadı.");
        }
      } else {
        throw new Error(res.data.message || "Haberler alınamadı.");
      }
    } catch (err) {
      console.error("Haberler alınamadı:", err);
      setError(
        err.message || "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
      );
      toast.error(err.message || "Haberler yüklenemedi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (news.length <= 1 || selectedNews) return;
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(autoScrollRef.current);
  }, [news.length, selectedNews]);

  // Stop auto-scroll on user interaction
  const stopAutoScroll = () => {
    clearInterval(autoScrollRef.current);
  };

  // Navigation
  const prevSlide = () => {
    stopAutoScroll();
    setCurrentIndex((prev) => (prev === 0 ? news.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    stopAutoScroll();
    setCurrentIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
  };

  // Swipe support
  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  // Open full news content
  const openNews = (item) => {
    stopAutoScroll();
    setSelectedNews(item);
  };

  // Close full news content
  const closeNews = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <div className="relative w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Haberler
        </h2>
        <div className="rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 aspect-w-4 aspect-h-3 bg-gray-200"></div>
            <div className="p-4 flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="relative w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-4">
          Haberler
        </h2>
        <div className="rounded-xl shadow-lg p-6 text-center text-gray-500">
          {error || "Aktif haber bulunamadı."}
        </div>
      </div>
    );
  }

  const item = news[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-10 mb-20">
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] mb-4">
        Haberler
      </h2>

      <div
        className="relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        {...handlers}
        role="region"
        aria-label="Haberler karuseli"
      >
        {/* Haber İçeriği */}
        <div className="flex flex-col md:flex-row">
          {/* Resim */}
          <div className="relative w-full md:w-1/3 aspect-w-4 aspect-h-3">
            {item.image ? (
              <img
                src={`${backendURL}${item.image}`}
                alt={item.title || "Haber resmi"}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Resim Yok</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Başlık + Açıklama */}
          <div className="p-4 sm:p-6 flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] line-clamp-2">
              {item.title || "Başlık Yok"}
            </h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {item.description || "Açıklama Yok"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {item.created_at && !isNaN(new Date(item.created_at))
                ? format(new Date(item.created_at), "dd MMM yyyy", {
                    locale: tr,
                  })
                : "-"}
            </p>
            <button
              onClick={() => openNews(item)}
              className="mt-3 text-sm text-[#B259AF] cursor-pointer transition-colors"
            >
              Devamını Oku
            </button>
          </div>
        </div>

        {/* Sol Ok */}
        <button
          onClick={prevSlide}
          onMouseEnter={stopAutoScroll}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#222]"
          aria-label="Önceki haber"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Sağ Ok */}
        <button
          onClick={nextSlide}
          onMouseEnter={stopAutoScroll}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#222]"
          aria-label="Sonraki haber"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Küçük Noktalar */}
      <div className="flex justify-center mt-3 gap-2">
        {news.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              stopAutoScroll();
              setCurrentIndex(i);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentIndex ? "bg-[#222] scale-125" : "bg-gray-400"
            }`}
            aria-label={`Haber ${i + 1}`}
            aria-current={i === currentIndex ? "true" : "false"}
          />
        ))}
      </div>

      {/* Full News Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={closeNews}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
                aria-label="Close news"
              >
                <X size={24} />
              </button>

              {/* News Content */}
              <div className="p-6">
                {selectedNews.image && (
                  <div className="relative w-full aspect-w-4 aspect-h-3 mb-4">
                    <img
                      src={`${backendURL}${selectedNews.image}`}
                      alt={selectedNews.title}
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">
                  {selectedNews.title || "Başlık Yok"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedNews.description || "Açıklama Yok"}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedNews.created_at &&
                  !isNaN(new Date(selectedNews.created_at))
                    ? format(new Date(selectedNews.created_at), "dd MMM yyyy", {
                        locale: tr,
                      })
                    : "-"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsSection;
