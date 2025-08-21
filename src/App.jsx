import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProjectDetail from "./pages/ProjectDetail";
import { ToastContainer } from "react-toastify";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminAllUsers from "./pages/admin/AdminAllUsers";
import AdminAddProject from "./pages/admin/AdminAddProject";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRoute from "./pages/admin/AdminRoute";
import AdminEditProject from "./pages/admin/AdminEditProject";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateProperty from "./pages/CreateProperty";
import AdminBivadanAlSat from "./pages/admin/AdminBivadanAlSat";
import PropertiesPage from "./pages/PropertiesPage";
import AdminProjectRequest from "./pages/admin/AdminProjectRequest";
import AdminUsersProjects from "./pages/admin/AdminUsersProjects";
import AdminAddNews from "./pages/admin/AdminAddNews";
import AdminNewsList from "./pages/admin/AdminNewsList";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projeler" element={<Projects />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/katil" element={<Register />} />
        <Route path="/uye-girisi" element={<Login />} />
        <Route path="/projeler/:id" element={<ProjectDetail />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/kullanicilar"
          element={
            <AdminRoute>
              <AdminAllUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/projeler/ekle"
          element={
            <AdminRoute>
              <AdminAddProject />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/projeler"
          element={
            <AdminRoute>
              <AdminProjects />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/mesajlar"
          element={
            <AdminRoute>
              <AdminMessages />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/projeler/duzenle/:id"
          element={
            <AdminRoute>
              <AdminEditProject />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bivadan-al-sat/ilanlar"
          element={
            <AdminRoute>
              <AdminBivadanAlSat />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/proje-katilim/istekleri-listele"
          element={
            <AdminRoute>
              <AdminProjectRequest />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/haberler/ekle"
          element={
            <AdminRoute>
              <AdminAddNews />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/haberler"
          element={
            <AdminRoute>
              <AdminNewsList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/proje-katilim/kullanicilar"
          element={
            <AdminRoute>
              <AdminUsersProjects />
            </AdminRoute>
          }
        />
        <Route path="/admin/giris" element={<AdminLogin />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/sifre-unuttum" element={<ForgotPassword />} />
        <Route path="/sifre-sifirla" element={<ResetPassword />} />
        <Route path="/katil-ozel/emlak-ekle" element={<CreateProperty />} />
        <Route path="/katil-ozel/ilanlar" element={<PropertiesPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      <WhatsAppButton />
      <ToastContainer />
    </div>
  );
}

export default App;
