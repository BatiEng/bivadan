import React from "react";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import FeaturedProjects from "../components/FeaturedProjects";

function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturedProjects />
    </div>
  );
}

export default HomePage;
