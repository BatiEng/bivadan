import React, { useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/biva-b.png"; // Ensure the logo file exists
import { GlobalContext } from "../contexts/GlobalContext";

const ProjectItem = ({ project, disableLink = false }) => {
  const { backendURL } = useContext(GlobalContext);

  return (
    <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-64">
        <img
          src={backendURL + project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <img
            src={logo}
            alt="Biva Logo"
            className="h-16 w-auto"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm mb-5 leading-relaxed">
          {project.description}
        </p>
        {disableLink ? (
          <div
            className="inline-block bg-gradient-to-r from-[#222] to-[#444] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-default"
            aria-label={`Detaylar için ${project.title} projesine git`}
          >
            Detaylar
          </div>
        ) : (
          <Link
            to={`/projeler/${project.id}`}
            className="inline-block bg-[#B259AF] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#A14A9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222]"
            aria-label={`Detaylar için ${project.title} projesine git`}
          >
            Detaylar
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectItem;
