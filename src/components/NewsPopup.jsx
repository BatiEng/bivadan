import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const NewsPopup = () => {
  const [news, setNews] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          "https://www.inovasyonbulutu.com/bivadan/api/get_news.php"
        );
        if (res.data.success) {
          // sadece aktif haberleri filtrele
          const activeNews = res.data.data.filter((n) => n.is_active === "1");
          if (activeNews.length > 0) {
            // created_at'e göre sırala (en yeni üstte)
            activeNews.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setNews(activeNews[0]); // en son eklenen haberi al
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Popup haberi alınamadı:", err);
      }
    };
    fetchNews();
  }, []);

  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-3xl max-h-[90vh] overflow-auto relative">
        {/* Kapat Butonu */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10"
        >
          <X size={28} />
        </button>

        {/* Resim */}
        {news.image && (
          <div className="flex justify-center items-center p-4">
            <img
              src={`https://www.inovasyonbulutu.com/bivadan/api/${news.image}`}
              alt={news.title}
              className="max-h-[70vh] w-auto object-contain rounded"
            />
          </div>
        )}

        {/* İçerik */}
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">{news.title}</h2>
          <p className="text-sm text-gray-600 mt-2">{news.description}</p>
          <p className="text-xs text-gray-400 mt-3">
            Eklenme Tarihi:{" "}
            {new Date(news.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsPopup;
