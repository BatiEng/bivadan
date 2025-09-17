import { useState, useEffect } from "react";

export default function CerezModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Modal */}
      <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 max-w-md w-[90%] text-center">
        <h2 className="text-lg font-semibold mb-3">Çerez Kullanımı</h2>
        <p className="text-sm mb-4">
          Bu site çerezleri kullanmaktadır. Deneyiminizi geliştirmek için
          çerezleri kabul etmelisiniz.
        </p>
        <div className="flex justify-center gap-4 items-center">
          <a
            href="https://bivadan.com/files/cerez-politikasi.docx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-[#B259AF] hover:text-[#A14A9E]"
          >
            Politika
          </a>
          <button
            onClick={handleAccept}
            className="bg-[#B259AF] hover:bg-[#A14A9E] text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
