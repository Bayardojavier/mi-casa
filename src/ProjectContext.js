import React, { createContext, useContext, useState } from 'react';

// 1. Crear el contexto
const ProjectContext = createContext();

// 2. Proveedor del contexto
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects(prev => [...prev, project]);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

// 3. Hook para usar el contexto más fácil
export const useProjects = () => useContext(ProjectContext);
