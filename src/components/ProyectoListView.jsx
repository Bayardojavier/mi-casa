import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjects } from '../ProjectContext';
import CreateProjectForm from './CreateProjectForm';

export default function ProyectoListView({ selectedProject, setSelectedProject }) {
  const { projects, addProject } = useProjects();
  const [showForm, setShowForm] = useState(false);

  const handleEnterProject = (project) => {
    setSelectedProject(project);
    alert(`Entraste al proyecto: ${project.name}`);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-100">
      
      <h2 className="text-3xl font-extrabold text-blue-600 mb-4 text-center">Proyectos</h2>
      <p className="text-gray-600 mb-6 text-center">
        Lista de proyectos creados y la opción de crear uno nuevo.
      </p>

      {/* Botón Crear Proyecto */}
      <button
        onClick={() => setShowForm(true)}
        className="mb-6 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" /> Crear Proyecto
      </button>

      {/* Modal Crear Proyecto */}
      {showForm && (
        <CreateProjectForm
          onClose={() => setShowForm(false)}
          onCreate={addProject}
        />
      )}

      {/* Lista de Proyectos */}
      {projects.length === 0 ? (
        <p className="text-gray-500 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
          No tienes proyectos aún. ¡Crea tu primero!
        </p>
      ) : (
        <div className="w-full max-w-3xl space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center transition hover:shadow-xl"
            >
              <div>
                <p className="font-bold text-gray-800 text-lg">{project.name}</p>
                {project.fases && project.fases.length > 0 && (
                  <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-2">
                    {project.fases.map(fase => (
                      <span
                        key={fase}
                        className="bg-gray-100 px-2 py-1 rounded-full text-gray-800"
                      >
                        {fase}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleEnterProject(project)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition"
              >
                Entrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
