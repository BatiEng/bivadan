import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ProjectItem from "./ProjectItem";
import { GlobalContext } from "../contexts/GlobalContext";

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { backendURL } = useContext(GlobalContext);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          backendURL + "get_projects.php?per_page=3"
        );
        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch projects");
        }

        // Map backend data to projects format
        const fetchedProjects = data.data.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          image: project.image || "https://via.placeholder.com/800x600", // Fallback image
        }));

        setProjects(fetchedProjects);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-12 tracking-tight">
            Öne Çıkan Projelerimiz
          </h2>
          <div className="text-center text-[#1a1a1a] text-lg">Loading...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-12 tracking-tight">
            Öne Çıkan Projelerimiz
          </h2>
          <div className="text-center text-red-500 text-lg">Error: {error}</div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-12 tracking-tight">
            Öne Çıkan Projelerimiz
          </h2>
          <div className="text-center text-[#1a1a1a] text-lg">
            No projects available
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-100 to-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#1a1a1a] mb-12 tracking-tight">
          Öne Çıkan Projelerimiz
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
