import React from "react";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import FeaturedProjects from "../components/FeaturedProjects";
import NewsSection from "../components/NewsSection";
import NewsPopup from "../components/NewsPopup";

function HomePage() {
  return (
    <div>
      <NewsPopup />
      <Navbar />
      <HeroSection />

      <FeaturedProjects />
      <NewsSection />
    </div>
  );
}

export default HomePage;
