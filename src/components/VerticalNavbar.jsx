import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutList,
  PlusCircle,
  Users,
  Building2,
  Menu,
  X,
} from "lucide-react";

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/10 transition"
        aria-expanded={open}
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="flex-1 text-left font-medium">{title}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="mt-1 ml-2 flex flex-col gap-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ItemLink = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
          isActive
            ? "bg-white text-[#1a1a1a] font-semibold"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`
      }
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      <span>{label}</span>
    </NavLink>
  );
};

const VerticalNavbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openProjeler, setOpenProjeler] = useState(false);
  const [openKullanicilar, setOpenKullanicilar] = useState(false);
  const [openAlSat, setOpenAlSat] = useState(false);
  const [openProjeKatilim, setOpenProjeKatilim] = useState(false);

  useEffect(() => {
    setOpenProjeler(
      location.pathname.startsWith("/admin/projeler") ||
        location.pathname === "/admin/projeler/ekle"
    );
    setOpenKullanicilar(location.pathname.startsWith("/admin/kullanicilar"));
    setOpenAlSat(location.pathname.startsWith("/admin/ilanlar"));
    setOpenProjeKatilim(location.pathname.startsWith("/admin/proje-katilim"));
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1f1f1f] rounded-lg text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:h-screen bg-[#1f1f1f] text-white p-4 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:transform-none ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="mb-6 pt-10 lg:pt-0">
          <div className="text-2xl font-extrabold tracking-tight">Biva</div>
          <div className="text-xs text-gray-400">Yönetim Paneli</div>
        </div>

        {/* Sections */}
        <nav className="space-y-1">
          <div className="mb-1">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-white text-[#1a1a1a] font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Anasayfa
            </NavLink>
          </div>

          {/* Projeler */}
          <div className="rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setOpenProjeler((v) => !v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 transition"
              aria-expanded={openProjeler}
            >
              <LayoutList size={18} />
              <span className="flex-1 text-left font-medium">Projeler</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openProjeler ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openProjeler
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="mt-1 ml-2 flex flex-col gap-1 pb-1">
                  <ItemLink
                    to="/admin/projeler"
                    icon={LayoutList}
                    label="Listele"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <ItemLink
                    to="/admin/projeler/ekle"
                    icon={PlusCircle}
                    label="Ekle"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kullanıcılar */}
          <div className="rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setOpenKullanicilar((v) => !v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 transition"
              aria-expanded={openKullanicilar}
            >
              <Users size={18} />
              <span className="flex-1 text-left font-medium">Kullanıcılar</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openKullanicilar ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openKullanicilar
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="mt-1 ml-2 flex flex-col gap-1 pb-1">
                  <ItemLink
                    to="/admin/kullanicilar"
                    icon={LayoutList}
                    label="Listele"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Proje Katılım */}
          <div className="rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setOpenProjeKatilim((v) => !v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 transition"
              aria-expanded={openProjeKatilim}
            >
              <Users size={18} />
              <span className="flex-1 text-left font-medium">
                Proje Katılım
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openProjeKatilim ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openProjeKatilim
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="mt-1 ml-2 flex flex-col gap-1 pb-1">
                  <ItemLink
                    to="/admin/proje-katilim/istekleri-listele"
                    icon={LayoutList}
                    label="İstekleri Listele"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <ItemLink
                    to="/admin/proje-katilim/kullanicilar"
                    icon={LayoutList}
                    label="Kullanıcıları Listele"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bivadan Al/Sat */}
          <div className="rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setOpenAlSat((v) => !v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 transition"
              aria-expanded={openAlSat}
            >
              <Building2 size={18} />
              <span className="flex-1 text-left font-medium">
                Bivadan Al/Sat
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openAlSat ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out ${
                openAlSat
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="mt-1 ml-2 flex flex-col gap-1 pb-1">
                  <ItemLink
                    to="/admin/bivadan-al-sat/ilanlar"
                    icon={LayoutList}
                    label="İlanlar"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default VerticalNavbar;
