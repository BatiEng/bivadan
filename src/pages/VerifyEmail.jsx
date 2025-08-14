import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function VerifyEmail() {
  const [status, setStatus] = useState("loading"); // loading | success | already | expired | invalid | notfound | error
  const { backendURL } = useContext(GlobalContext);
  const [message, setMessage] = useState("");
  const [emailForResend, setEmailForResend] = useState("");
  const [resendState, setResendState] = useState({
    sending: false,
    done: false,
    error: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    const token = params.get("token");

    if (!uid || !token) {
      setStatus("invalid");
      setMessage("Geçersiz doğrulama bağlantısı.");
      return;
    }

    const verify = async () => {
      try {
        const url = `${backendURL}/verify_email.php?uid=${encodeURIComponent(
          uid
        )}&token=${encodeURIComponent(token)}`;
        const res = await axios.get(url, { validateStatus: () => true }); // handle non-200s
        // Normalize by HTTP status
        if (res.status === 200 && res.data?.success) {
          // Could be already verified or just verified now
          const msg = res.data?.message || "E-posta doğrulandı.";
          if (/zaten/i.test(msg)) {
            setStatus("already");
          } else {
            setStatus("success");
          }
          setMessage(msg);
        } else if (res.status === 410) {
          setStatus("expired");
          setMessage(res.data?.message || "Bağlantının süresi dolmuş.");
        } else if (res.status === 404) {
          setStatus("notfound");
          setMessage(res.data?.message || "Kullanıcı bulunamadı.");
        } else if (res.status === 400 || res.status === 422) {
          setStatus("invalid");
          setMessage(res.data?.message || "Geçersiz doğrulama isteği.");
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Beklenmeyen bir hata oluştu.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.");
      }
    };

    verify();
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailForResend) return;

    setResendState({ sending: true, done: false, error: "" });
    try {
      const res = await axios.post(
        `${backendURL}/resend_verify_email.php`,
        { email: emailForResend },
        { validateStatus: () => true }
      );
      if (res.status === 200 && res.data?.success) {
        setResendState({ sending: false, done: true, error: "" });
      } else {
        setResendState({
          sending: false,
          done: false,
          error: res.data?.message || "Gönderim başarısız.",
        });
      }
    } catch {
      setResendState({
        sending: false,
        done: false,
        error: "Sunucuya ulaşılamadı.",
      });
    }
  };

  const renderIcon = () => {
    if (status === "loading") return "⏳";
    if (status === "success" || status === "already") return "✅";
    if (status === "expired") return "⏰";
    if (status === "notfound") return "🔍";
    if (status === "invalid") return "⚠️";
    return "❌"; // error
  };

  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="my-30 flex items-center justify-center  p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8">
          <div className="text-4xl mb-4">{renderIcon()}</div>
          <h1 className="text-2xl font-semibold mb-2">
            {status === "loading" && "Doğrulanıyor..."}
            {status === "success" && "E‑posta Doğrulandı"}
            {status === "already" && "Zaten Doğrulanmış"}
            {status === "expired" && "Bağlantının Süresi Dolmuş"}
            {status === "invalid" && "Geçersiz Bağlantı"}
            {status === "notfound" && "Kullanıcı Bulunamadı"}
            {status === "error" && "Bir Hata Oluştu"}
          </h1>
          <p className="text-gray-600 mb-6">
            {message || "Lütfen bekleyin..."}
          </p>

          {(status === "success" || status === "already") && (
            <a
              href="/uye-girisi"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-[#B259AF] hover:bg-[#A14A9E] text-white font-medium  transition"
            >
              Giriş Yap
            </a>
          )}

          {status === "expired" && (
            <form onSubmit={handleResend} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Doğrulama e-postasını tekrar göndermek için adresinizi yazın:
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ornek@bivadan.com"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
              />
              <button
                type="submit"
                disabled={resendState.sending}
                className="w-full rounded-xl px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {resendState.sending ? "Gönderiliyor..." : "Tekrar Gönder"}
              </button>
              {resendState.done && (
                <p className="text-green-600 text-sm">
                  E‑posta gönderildi! Gelen kutunuzu kontrol edin.
                </p>
              )}
              {resendState.error && (
                <p className="text-red-600 text-sm">{resendState.error}</p>
              )}
            </form>
          )}

          {(status === "invalid" ||
            status === "notfound" ||
            status === "error") && (
            <a
              href="/"
              className="inline-flex mt-2 items-center justify-center rounded-xl px-5 py-3 bg-[#B259AF] hover:bg-[#A14A9E] text-gray-800 font-medium  transition"
            >
              Ana Sayfa
            </a>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
