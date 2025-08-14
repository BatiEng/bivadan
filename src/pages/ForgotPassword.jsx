// src/pages/ForgotPassword.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const { backendURL } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!email) return setErr("E‑posta zorunludur.");

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendURL}request_password_reset.php`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        setMsg(
          res.data.message || "Eğer hesabınız varsa bir bağlantı gönderdik."
        );
        setEmail("");
      } else {
        setErr(res.data?.message || "İşlem başarısız.");
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="my-30 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Şifremi Unuttum</h1>

          {msg && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
              {msg}
            </div>
          )}
          {err && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E‑posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="ornek@domain.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
