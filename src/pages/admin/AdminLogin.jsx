import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import { Eye, EyeOff, Shield } from "lucide-react";
import { GlobalContext } from "../../contexts/GlobalContext";

const AdminLogin = () => {
  const { backendURL } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.email || !form.password) {
      setErr("E‑posta ve şifre zorunludur.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendURL}admin_login.php`,
        { email: form.email, password: form.password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        const user = res.data.user;
        // Persist session (respect “remember me”)
        const store = form.remember ? localStorage : sessionStorage;
        store.setItem("authUser", JSON.stringify(user));
        localStorage.setItem("rememberLogin", form.remember ? "1" : "0");
        navigate("/admin"); // or /admin/panel
      } else {
        setErr(res.data?.message || "Giriş başarısız.");
      }
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        e2.message ||
        "Sunucu hatası.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-[#222]" />
          <h1 className="text-2xl font-bold">Admin Girişi</h1>
        </div>

        {err && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
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
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
              placeholder="admin@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                required
                className="w-full py-3 px-4 pr-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222]"
                placeholder="******"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 text-[#222] focus:ring-[#222] border-gray-300 rounded"
              />
              Beni hatırla
            </label>
            <Link to="/" className="text-sm text-[#222] underline">
              Siteye dön
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#222] hover:bg-[#333] text-white py-3 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
