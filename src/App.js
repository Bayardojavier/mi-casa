import React, { useState, useEffect } from "react";
import Welcome from "./components/Welcome.jsx";
import ProjectList from "./components/ProjectList.jsx";
import ProjectReport from "./components/ProjectReport.jsx";
import ProjectBody from "./components/ProjectBody.jsx";

// 🔑 CLAVE 1: LÓGICA PARA CARGAR LOS DATOS DESDE LOCALSTORAGE
const loadProjects = () => {
    try {
        const serializedProjects = localStorage.getItem('myProjectsApp_projects');
        if (serializedProjects === null) {
            return []; // Retorna un array vacío si no hay nada guardado
        }
        // Devuelve los proyectos analizados desde JSON
        return JSON.parse(serializedProjects);
    } catch (error) {
        console.error("Error al cargar proyectos desde LocalStorage:", error);
        return [];
    }
};

function App() {
    // 🔑 CLAVE 2: Inicialización perezosa: Carga 'projects' al inicio
    const [projects, setProjects] = useState(loadProjects);
    
    const [selectedProject, setSelectedProject] = useState(null); 
    const [projectToEdit, setProjectToEdit] = useState(null); 
    
    // MIGRACIÓN: Usaremos un único estado para la vista: 'welcome' | 'list' | 'report' | 'body'
    const [viewMode, setViewMode] = useState("welcome"); 

    // 🔑 CLAVE 3: Guardado Persistente con useEffect
    // Se ejecuta cada vez que el array 'projects' (la lista completa) cambia.
    useEffect(() => {
        try {
            const serializedProjects = JSON.stringify(projects);
            localStorage.setItem('myProjectsApp_projects', serializedProjects);
        } catch (error) {
            console.error("Error al guardar proyectos en LocalStorage:", error);
        }
    }, [projects]); // Dependencia clave: solo se ejecuta cuando 'projects' cambia


    const handleEnter = () => setViewMode("list");
    
    // 1. CREAR PROYECTO
    const handleCreateProject = (newProject) => {
        setProjects(prevProjects => [...prevProjects, newProject]);
        // Después de crear, lo enviamos al cuerpo del proyecto para que empiece a trabajar
        setSelectedProject(newProject);
        setViewMode("body"); 
    };
    
    // 2. ABRIR EL REPORTE (Llamado por el botón "Ver Reporte")
    const handleEnterReport = (project) => {
        setSelectedProject(project); 
        setViewMode('report');
    };
    
    // 3. ABRIR EL CUERPO DEL PROYECTO (Llamado por el botón "Ir a Proyecto")
    const handleGoToProject = (project) => {
        setSelectedProject(project);
        setViewMode('body');
    };

    // 4. VOLVER A LA LISTA (Llamado desde Reporte y desde Body)
    const handleBackToList = () => {
        setSelectedProject(null); // Limpiar el proyecto actual
        setViewMode('list');
    };

    // 5. GUARDAR CAMBIOS (MODIFICACIÓN de avance/costo - USADA POR REPORT Y BODY)
    // Este cambio en 'projects' automáticamente dispara el useEffect de guardado.
    const handleSaveProject = (updatedProject) => {
        setProjects(
            projects.map(p => p.id === updatedProject.id ? updatedProject : p)
        );
        setSelectedProject(updatedProject); // Actualizar el proyecto en vista
    };

    // 6. INICIAR EDICIÓN DE FASES (Llamado desde ProjectReport)
    const handleStartPhaseEdit = () => {
        setProjectToEdit(selectedProject); 
        setViewMode('list'); // Volvemos a la lista para que se renderice el modal de fases
        setSelectedProject(null); 
    };

    // 7. GUARDAR FASES EDITADAS (Llamado desde ProjectList después del formulario)
    // Este cambio en 'projects' automáticamente dispara el useEffect de guardado.
    const handleSaveEditedPhases = (updatedProject) => {
        if (updatedProject) {
            setProjects(
                projects.map(p => p.id === updatedProject.id ? updatedProject : p)
            );
            // Opcional: Volver al cuerpo después de editar fases, si el usuario estaba allí
            setSelectedProject(updatedProject);
            setViewMode('body');
        }
        setProjectToEdit(null); // Finalizar el modo edición
    };


    // ----------------------------------------------------
    // RENDERIZADO CONDICIONAL DE VISTAS
    // ----------------------------------------------------

    let content = null;

    if (viewMode === "welcome") {
        content = <Welcome onEnter={handleEnter} />;
    } 
    else if (viewMode === "list") {
        content = (
            <ProjectList
                projects={projects}
                onCreateProject={handleCreateProject}
                onEnterProject={handleEnterReport} // Botón: Ver Reporte
                onGoToProject={handleGoToProject}  // Botón: Ir a Proyecto
                onSaveEditedPhases={handleSaveEditedPhases}
                projectToEdit={projectToEdit}
            />
        );
    }
    // VISTA 'BODY': Dashboard de Gestión
    else if (viewMode === "body" && selectedProject) {
        content = (
            <ProjectBody
                project={selectedProject}
                onBackToProjects={handleBackToList} 
                onSaveProject={handleSaveProject} 
            />
        );
    }
    // VISTA 'REPORT': Reporte del Proyecto (Modal)
    else if (viewMode === "report" && selectedProject) {
        content = (
            <ProjectReport 
                project={selectedProject} 
                onExit={handleBackToList} // Volver a la lista
                onSave={handleSaveProject} // Usamos la misma función de guardado
                onEditProjectStructure={handleStartPhaseEdit} 
                onGoToBody={() => handleGoToProject(selectedProject)} 
            />
        );
    }


    return (
        <div className="h-screen w-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center">
            {content}
        </div>
    );
}

export default App;