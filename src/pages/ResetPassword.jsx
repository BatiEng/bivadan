// src/pages/ResetPassword.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalContext } from "../contexts/GlobalContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const useQuery = () => new URLSearchParams(useLocation().search);

const ResetPassword = () => {
  const { backendURL } = useContext(GlobalContext);
  const navigate = useNavigate();
  const query = useQuery();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = query.get("token") || "";
    setToken(t);
    window.scrollTo(0, 0);
  }, []); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token) return setErr("Geçersiz bağlantı.");
    if (!password || !passwordConfirm)
      return setErr("Lütfen şifre alanlarını doldurun.");
    if (password !== passwordConfirm) return setErr("Şifreler eşleşmiyor.");

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendURL}reset_password.php`,
        { token, password, password_confirm: passwordConfirm },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        setMsg("Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz…");
        setTimeout(() => navigate("/uye-girisi"), 1500);
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
      <div className="my-30 flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Yeni Şifre Belirleyin</h1>

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
                Yeni Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="******"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="******"
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {loading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
