import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlobalContext } from "../contexts/GlobalContext";

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const { backendURL } = useContext(GlobalContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          backendURL + "get_projects.php?per_page=12"
        );
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch projects");
        }

        const fetchedSlides = data.data.map((project) => ({
          src: project.image || "https://via.placeholder.com/800x600",
          title: project.title,
          href: `/projeler/${project.id}`,
        }));

        setSlides(fetchedSlides);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [backendURL]);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const getDotCount = () => {
    return isMobile ? slides.length : Math.ceil(slides.length / 4);
  };

  const handleDotClick = (idx) => {
    if (isMobile) {
      setCurrentIndex(idx + slides.length);
    } else {
      setCurrentIndex(idx * 4 + slides.length);
    }
  };

  // Handle transition end to reset the index for seamless looping
  const handleTransitionEnd = () => {
    if (currentIndex >= slides.length * 2) {
      setCurrentIndex(slides.length);
    } else if (currentIndex < slides.length) {
      setCurrentIndex(slides.length * 2 - 1);
    }
  };

  if (loading) {
    return (
      <section className="relative w-full h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-[#222] text-lg">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative w-full h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-[#222] text-lg">No projects available</div>
      </section>
    );
  }

  // Create an array with slides duplicated for seamless looping
  const extendedSlides = [...slides, ...slides, ...slides];

  return (
    <section className="relative w-full h-[calc(100vh-100px)] overflow-hidden">
      <div
        className="h-full flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${
            (currentIndex * 100) / (isMobile ? 1 : 4)
          }%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((item, idx) => (
          <Link
            key={idx}
            to={item.href}
            className="relative w-full sm:w-1/4 h-full flex-shrink-0 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222]"
            aria-label={`${item.title} projesine git`}
          >
            <div className="border-l border-r border-gray-200 overflow-hidden relative w-full h-full">
              <img
                src={backendURL + item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#222]/60 via-[#222]/10 to-transparent" />

            <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />

            <div className="absolute bottom-10 left-4 right-4">
              <span className="inline-block bg-[#B259AF]/80 text-white px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm text-sm md:text-base font-semibold">
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#222]"
        aria-label="Önceki slayt"
      >
        <ChevronLeft size={28} className="text-[#222]" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#222]"
        aria-label="Sonraki slayt"
      >
        <ChevronRight size={28} className="text-[#222]" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {Array.from({ length: getDotCount() }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-3 h-3 rounded-full transition-transform duration-300 ${
              idx ===
              (isMobile
                ? currentIndex % slides.length
                : Math.floor((currentIndex % slides.length) / 4))
                ? "bg-[#222] scale-125"
                : "bg-gray-400 hover:scale-110"
            }`}
            aria-label={`Slayt ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
