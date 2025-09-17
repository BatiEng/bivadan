import React from "react";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import FeaturedProjects from "../components/FeaturedProjects";
import NewsSection from "../components/NewsSection";
import NewsPopup from "../components/NewsPopup";
import CerezBanner from "../components/CerezBanner";

function HomePage() {
  return (
    <div>
      <NewsPopup />
      <Navbar />
      <CerezBanner />
      <HeroSection />
      <NewsSection />

      <FeaturedProjects />
    </div>
  );
}

export default HomePage;
