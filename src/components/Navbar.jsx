import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import logo from "../assets/biva-logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  const toggleMenu = () => setIsOpen((o) => !o);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    if (storedUser) {
      try {
        setAuthUser(JSON.parse(storedUser));
      } catch {
        setAuthUser(null);
      }
    }
  }, []);

  const canSeeBivadan =
    !!authUser && !!authUser.is_activation && !!authUser.is_confirm;

  return (
    <nav className="bg-[#222] shadow-lg w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-25 items-center">
          {/* Logo */}
          <div className="flex items-center w-50">
            <Link to="/" onClick={closeMenu}>
              <img src={logo} alt="Biva Logo" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="/"
              className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
            >
              Anasayfa
            </a>
            <a
              href="/projeler"
              className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
            >
              Projeler
            </a>
            <a
              href="/iletisim"
              className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
            >
              İletişim
            </a>

            <a
              href="/katil-ozel/ilanlar"
              className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
            >
              Bivadan Al Sat
            </a>

            {authUser ? (
              <a
                href="/profil"
                className="text-gray-200 hover:text-white transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <User size={20} />
                {authUser.name || "Profil"}
              </a>
            ) : (
              <>
                <a
                  href="/katil"
                  className="text-gray-200 hover:text-white transition-colors duration-200 font-medium"
                >
                  Katıl
                </a>
                <a
                  href="/uye-girisi"
                  className="text-white bg-[#B259AF] hover:bg-[#A14A9E] transition-colors duration-200 font-medium px-4 py-2 rounded-md"
                >
                  Üye Girişi
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md p-2"
              aria-label="Menüyü aç/kapat"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (now same color as desktop) */}
      <div
        className={`md:hidden bg-[#222] shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          <a
            href="/"
            className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2"
            onClick={closeMenu}
          >
            Anasayfa
          </a>
          <a
            href="/projeler"
            className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2"
            onClick={closeMenu}
          >
            Projeler
          </a>
          <a
            href="/iletisim"
            className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2"
            onClick={closeMenu}
          >
            İletişim
          </a>

          <a
            href="/katil-ozel/ilanlar"
            className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2"
            onClick={closeMenu}
          >
            Bivadan Al Sat
          </a>

          {authUser ? (
            <a
              href="/profil"
              className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2 flex items-center gap-2"
              onClick={closeMenu}
            >
              <User size={20} />
              {authUser.name || "Profil"}
            </a>
          ) : (
            <>
              <a
                href="/katil"
                className="block text-gray-200 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={closeMenu}
              >
                Katıl
              </a>
              <a
                href="/uye-girisi"
                className="block text-white bg-[#B259AF] hover:bg-[#A14A9E] transition-colors duration-200 font-medium py-2 px-4 rounded-md text-center"
                onClick={closeMenu}
              >
                Üye Girişi
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
