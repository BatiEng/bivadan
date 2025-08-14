import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/biva-black.png";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { GlobalContext } from "../contexts/GlobalContext";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendURL } = useContext(GlobalContext);
  const [form, setForm] = useState({
    email: "",
    sifre: "",
    remember: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.sifre) {
      toast.error("E‑posta ve şifre zorunludur!", { autoClose: 2000 });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${backendURL}login.php`, {
        email: form.email,
        password: form.sifre,
      });
      console.log(res);
      if (res.data?.success) {
        toast.success("Giriş başarılı!", {
          autoClose: 2000,
        });
        const user = res.data.user;
        // Persist session
        const storage = form.remember ? localStorage : sessionStorage;
        storage.setItem("authUser", JSON.stringify(user));

        // “remember me” choice
        localStorage.setItem("rememberLogin", form.remember ? "1" : "0");

        navigate("/projeler");
      } else {
        toast.error(res.data?.message || "Giriş başarısız.", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Sunucu hatası. Lütfen tekrar deneyin.";
      toast.error(msg, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-5xl gap-10 items-center">
          {/* Left: Logo / Brand */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <img
              src={logo}
              alt="Biva"
              className="w-100 h-auto object-contain"
            />
          </div>

          {/* Right: Form */}
          <section className="flex-1">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-extrabold text-center text-[#1a1a1a] mb-8 tracking-tight">
                Üye Girişi
              </h2>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-8 space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    E‑posta Adresi
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                    placeholder="E-posta adresinizi girin"
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="sifre"
                    className="block text-sm font-medium text-[#1a1a1a] mb-1"
                  >
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      id="sifre"
                      name="sifre"
                      value={form.sifre}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 pr-11 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#222] text-gray-700 placeholder-gray-400"
                      placeholder="Şifrenizi girin"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={form.remember}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#222] focus:ring-[#222] border-gray-300 rounded"
                    />
                    Beni hatırla
                  </label>

                  <Link
                    to="/sifre-unuttum"
                    className="text-sm text-[#222] hover:text-[#444] underline"
                  >
                    Şifremi unuttum?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B259AF] text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-[#A14A9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="h-px bg-gray-200 flex-1" />
                  veya
                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                {/* Register link */}
                <p className="text-center text-sm text-gray-600">
                  Hesabın yok mu?{" "}
                  <Link
                    to="/katil"
                    className="text-[#222] font-semibold underline hover:text-[#444]"
                  >
                    Hemen kayıt ol
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
