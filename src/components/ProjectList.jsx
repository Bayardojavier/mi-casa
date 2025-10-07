import React, { useState, useEffect } from "react";
import CreateProjectForm from "./CreateProjectForm";
import './ProjectList.css'; 

const GRUPOS_DISPONIBLES = [
    {
        nombre: "0. Adquisición y Legalización del Terreno 🇳🇮",
        subfases: [
            "Búsqueda y Pre-selección de Propiedad", "Estudio de Títulos y Solvencia Municipal",
            "Elaboración de Promesa de Compra-Venta (Pacto de Cuota)", "Contrato Final de Compra-Venta (Escritura Pública)",
            "Pago de Impuestos de Transferencia (ITF)", "Inscripción en el Registro Público de la Propiedad (RPP)",
            "Gastos Legales y Honorarios de Notaría",
        ],
    },
    {
        nombre: "1. Planificación, Diseño y Permisos",
        subfases: [
            "Estudios de Suelo y Topografía", "Diseño Arquitectónico Final",
            "Obtención de Permisos de Construcción Municipal/Gubernamental", "Aprobación de Servicios (Luz, Agua, Drenaje)",
            "Plan de Seguridad e Higiene en Obra",
        ],
    },
    {
        nombre: "2. Obra Gruesa: Estructura y Cimentación",
        subfases: [
            "Limpieza y nivelación del terreno", "Excavación", "Cimentación y zapatas",
            "Muros de la planta baja", "Muros de la planta alta", "Techos / Cubiertas",
            "Columnas y vigas",
        ],
    },
    {
        nombre: "3. Instalaciones (Eléctricas, Plomería, Drenaje)",
        subfases: [
            "Instalación Eléctrica", "Instalación de Plomería / Agua potable",
            "Sistema de Drenaje", "Instalación de Gas / Energía alternativa",
        ],
    },
    {
        nombre: "4. Acabados Interiores",
        subfases: [
            "Pisos y revestimientos interiores", "Pintura y acabados de paredes",
            "Colocación de Puertas y ventanas", "Techo interior / Plafones",
        ],
    },
    {
        nombre: "5. Acabados Exteriores y Paisajismo",
        subfases: [
            "Fachada y Pintura exterior", "Jardinería / Paisajismo", "Cercado / Portones",
        ],
    },
    {
        nombre: "6. Espacios y Mobiliario Clave",
        subfases: [
            "Mobiliario de Cocina", "Mobiliario y Accesorios de Baños",
            "Acabados Sala / Comedor / Dormitorios", "Acabados Garage / Cochera",
        ],
    },
    {
        nombre: "7. Extras y Opcionales",
        subfases: [
            "Construcción de Alberca / Piscina", "Construcción de Cabaña / Establo para caballos",
            "Construcción de Terraza / Patio", "Área de BBQ / Asador",
            "Construcción de Gimnasio", "Cuarto de máquinas / Bodega",
        ],
    },
    {
        nombre: "8. Cierre, Control de Calidad y Legal",
        subfases: [
            "Control de Calidad (Inspecciones)", "Manejo de Residuos y Escombros",
            "Limpieza Fina de Obra", "Manuales de Usuario y Garantías",
            "Declaratoria de Obra Terminada / Final de Obra (Habitabilidad)",
        ],
    },
];

const calculateProjectSummary = (project) => {
    let grandTotalCost = 0;
    let grandTotalAvanceWeighted = 0;
    let grandTotalWeight = 0;

    project.fases.forEach(faseName => {
        const detail = project.faseDetails?.[faseName] || {};
        
        const costo = parseFloat(detail.costo) || 1000;
        const avance = parseFloat(detail.avance) || 0;

        grandTotalCost += costo;
        grandTotalAvanceWeighted += avance * costo;
        grandTotalWeight += costo;
    });

    const totalProjectAvance = grandTotalWeight > 0
        ? (grandTotalAvanceWeighted / grandTotalWeight).toFixed(0)
        : 0;

    return {
        costoTotal: grandTotalCost.toFixed(2),
        avancePorcentaje: parseInt(totalProjectAvance),
    };
};

// ------------------------------------------------------------------

const ProjectList = ({ 
    projects, 
    onCreateProject, 
    onEnterProject,     
    onGoToProject,      
    projectToEdit, 
    onSaveEditedPhases 
}) => {
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); 
    const [formData, setFormData] = useState({ 
        name: "", 
        owner: "", 
        address: "" 
    });
    // Estado para controlar el menú desplegable
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                name: projectToEdit.name,
                owner: projectToEdit.owner,
                address: projectToEdit.address,
            });
            setIsFormOpen(true);
            setCurrentStep(2); 
        }
    }, [projectToEdit]); 
    
    const handleMenuLeave = () => {
        // Cierra el menú automáticamente si el ratón sale del contenedor
        if (isMenuOpen && !isFormOpen) { 
            setIsMenuOpen(false);
        }
    };

    const handleNextStep = () => {
        const { name, owner, address } = formData;
        if (!name || !owner || !address) {
            alert("Por favor, completa el Nombre, Dueño y Dirección del proyecto.");
            return;
        }
        setCurrentStep(2);
    };

    const handleBackStep = () => {
        setCurrentStep(1);
    };

    const handleFormSubmit = (selectedFases) => {
        const { name, owner, address } = formData;
        if (!name || !owner || !address) {
            alert("Error: La información básica del proyecto está incompleta.");
            return;
        }
        if (projectToEdit) {
            const updatedProject = { ...projectToEdit, name, owner, address, fases: selectedFases };
            onSaveEditedPhases(updatedProject);
        } else {
            const newProject = {
                id: Date.now(), name, owner, address, fases: selectedFases,
                faseDetails: selectedFases.reduce((acc, fase) => {
                    acc[fase] = { avance: 0, costo: 1000 }; 
                    return acc;
                }, {}),
            };
            onCreateProject(newProject);
        }
        handleCloseForm();
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setCurrentStep(1); 
        setFormData({ name: "", owner: "", address: "" });
        if (projectToEdit) { onSaveEditedPhases(null); }
        // Cierra el menú después de una acción 
        setIsMenuOpen(false); 
    };
    
    // --- FUNCIÓN CLAVE: IMPORTAR PROYECTO ---
    const handleImportProject = (event) => {
        // Cierra el menú antes de la acción de archivo
        setIsMenuOpen(false); 
        const file = event.target.files[0];
        event.target.value = null; 
        
        if (!file || (file.type !== "application/json" && !file.name.endsWith('.json'))) {
            alert("⚠️ Error: Solo se permiten archivos de tipo JSON (.json).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedProject = JSON.parse(e.target.result);
                
                if (typeof importedProject !== 'object' || !importedProject.id || !importedProject.name || !Array.isArray(importedProject.fases)) {
                    throw new Error("El archivo no contiene una estructura de proyecto válida (falta ID, Nombre o Fases).");
                }
                
                let projectToSave = importedProject;
                
                const existingProject = projects.find(p => p.name === importedProject.name);

                if (existingProject) {
                    const action = prompt(
                        `⚠️ Ya existe un proyecto llamado "${importedProject.name}".\n\n¿Qué desea hacer?\n\n1. Renombrar el proyecto importado\n2. Cancelar la importación`
                    );

                    if (action === '1') {
                        let newName;
                        while (!newName || projects.some(p => p.name === newName)) {
                            newName = prompt(`Ingrese el nuevo nombre para el proyecto (ej: ${importedProject.name} (Importado)):`);
                            if (newName === null) return;
                            if (projects.some(p => p.name === newName)) {
                                alert("Ese nombre ya existe. Por favor, elige otro.");
                            }
                        }
                        projectToSave = { ...importedProject, name: newName };
                    } else {
                        alert("Importación cancelada.");
                        return;
                    }
                }
                
                const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                projectToSave.id = newId;

                onCreateProject(projectToSave);
                alert(`✅ Proyecto "${projectToSave.name}" importado con éxito. Se añadió a tu lista.`);

            } catch (error) {
                console.error("Error al importar o parsear el proyecto:", error);
                alert(`❌ Error al importar: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };
    
    // --- FUNCIÓN CLAVE: EXPORTAR PROYECTO (Se mantiene igual) ---
    const handleExportProject = (projectToExport) => {
        const projectName = projectToExport.name || 'Proyecto_Sin_Nombre';
        const dataStr = JSON.stringify(projectToExport, null, 2); 
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${cleanName}_${projectToExport.id.toString().slice(0, 8)}.json`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Proyecto exportado con éxito como:\n${fileName}`); 
    };


    // --- Renderizado de tarjetas (Se mantiene igual) ---
    const renderProjectCards = () => {
        if (projects.length === 0) {
            return (
                <p className="text-gray-300" style={{ color: '#7f8c8d', marginTop: '20px', fontSize: '1.1rem' }}>
                    No tienes proyectos creados. Usa el menú de la esquina superior derecha para crear o importar uno.
                </p>
            );
        }

        return (
            <div className="projects-wrapper"> 
                {projects.map(project => {
                    const summary = calculateProjectSummary(project);

                    return (
                        <div 
                            key={project.id} 
                            className="project-card-dark" 
                        >
                            {/* ICONO DE EXPORTAR (Se mantiene en la esquina) */}
                            <button
                                className="export-icon-button"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleExportProject(project); 
                                }}
                                title="Exportar Proyecto (.json)" 
                            >
                                ⬇️
                            </button>

                            <h4 className="project-name">{project.name}</h4>
                            
                            {/* Bloque de Avance/Costo */}
                            <div className="project-summary-box">
                                {/* Avance Total */}
                                <p className="summary-item">
                                    <strong style={{ fontWeight: 'normal' }}>Avance Total:</strong> 
                                    <span className="text-green-avance"> 
                                        {summary.avancePorcentaje}%
                                    </span>
                                </p>
                                {/* Costo Total (Separado por un espacio o un separador) */}
                                <p className="summary-item summary-item-costo">
                                    <strong style={{ fontWeight: 'normal' }}>Costo Total (Est.):</strong> 
                                    <span className="text-yellow-costo"> 
                                        ${summary.costoTotal}
                                    </span>
                                </p>
                            </div>

                            {/* Bloque Dueño/Tareas */}
                            <div className="project-details-info">
                                <p> 
                                    <strong style={{ fontWeight: 'normal' }}>Dueño:</strong> {project.owner} 
                                </p>
                                <p> 
                                    <strong style={{ fontWeight: 'normal' }}>Tareas:</strong> {project.fases.length} fases 
                                </p>
                            </div>

                            {/* Botones de Acción */}
                            <div className="card-actions-row">
                                 <button 
                                     className="go-to-project-button" 
                                     onClick={(e) => {
                                         e.stopPropagation(); 
                                         onGoToProject(project); 
                                     }}
                                 >
                                     📝 Ir a Proyecto
                                 </button>

                                 <button 
                                     className="project-report-btn"
                                     onClick={(e) => {
                                         e.stopPropagation(); 
                                         onEnterProject(project); 
                                     }}
                                 >
                                     📊 Ver Reporte
                                 </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- RENDERIZADO PRINCIPAL ---
   return (
        <div className="project-list-container"> 
            
            {/* 🔑 CONTENEDOR DEL MENÚ FIJO CON EVENTOS DE MOUSE */}
            {/* 🎯 Este div ahora engloba tanto el botón como el menú desplegable. */}
            {/* El evento onMouseLeave aplica a TODO el área. */}
            <div 
                className="corner-menu-container"
                onMouseLeave={handleMenuLeave} // ⬅️ Cierra cuando sale de TODO el contenedor
            >
                {/* Botón de control (el ícono de engranaje) */}
                <button
                    className="menu-toggle-button"
                    // Mantener el onClick como principal forma de abrir/cerrar
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    title="Opciones de Proyectos (Nuevo/Importar)"
                >
                    {isMenuOpen ? 'X' : '⚙️'} 
                </button>
                
                {/* Contenedor del menú desplegable (Condicional) */}
                {isMenuOpen && (
                    <div className="menu-dropdown">
                        
                        {/* 1. BOTÓN DE IMPORTAR PROYECTO (.json) */}
                        <label 
                            htmlFor="import-file-menu" 
                            className="menu-action-button menu-import"
                            // 🔑 Ya no necesitamos handleMenuLeave aquí, se cerrará al hacer clic en el input/label y disparar la acción
                        >
                            ⬆️ Importar Proyecto
                        </label>
                        <input 
                            type="file" 
                            id="import-file-menu" 
                            accept=".json" 
                            onChange={handleImportProject} 
                            style={{ display: 'none' }} 
                        />

                        {/* 2. BOTÓN DE CREAR NUEVO PROYECTO */}
                        <button 
                            // 🔑 La función handleCloseForm al final de handleFormSubmit se encarga de cerrar el menú.
                            onClick={() => { setIsFormOpen(true); setIsMenuOpen(false); }}
                            className="menu-action-button menu-new-project"
                        >
                            ➕ Nuevo Proyecto
                        </button>
                    </div>
                )}
            </div>
            
            <h1 className="project-list-title project-list-title-padded">
                🔨 Mis Proyectos de Construcción
            </h1>
            <p className="text-gray-300" style={{ color: '#34495e' }}>
                Administra tus proyectos y haz seguimiento a sus fases de avance.
            </p>
            
            <div className="projects-wrapper">
                {renderProjectCards()}
            </div>

            {/* Renderizado Condicional del Modal/Flujo de Creación (Se mantiene igual) */}
            {isFormOpen && (
                <div className="modal-backdrop-custom"> 
                    <div className="create-form-content">
                        
                        {/* PASO 1: DETALLES BÁSICOS */}
                        {currentStep === 1 && (
                            <div className="input-details-form">
                                
                                <h3 style={{ color: '#3498db', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                    Paso 1: Detalles del Proyecto
                                </h3>
                                <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                                    Ingresa la información básica para identificar tu proyecto.
                                </p>
                                
                                <div className="details-form">
                                    <label className="input-label">
                                        Nombre del Proyecto
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="text-input" 
                                        />
                                    </label>
                                    <label className="input-label">
                                        Propietario/a
                                        <input
                                            type="text"
                                            value={formData.owner}
                                            onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                                            className="text-input"
                                        />
                                    </label>
                                    <label className="input-label">
                                        Dirección / Ubicación
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            className="text-input"
                                        />
                                    </label>
                                </div>

                                {/* Botones de Navegación del Paso 1 */}
                                <div className="form-actions-details">
                                    <button 
                                        onClick={handleCloseForm}
                                        className="cancel-button" 
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="submit-button"
                                    >
                                        Continuar a Fases &rarr;
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* PASO 2: SELECCIÓN DE FASES */}
                        {currentStep === 2 && (
                            <div className="phase-selection-wrapper">
                                
                                <h3 style={{ color: '#3498db', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                    Paso 2: Seleccionar Fases y Tareas
                                </h3>
                                <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                                    Selecciona los grupos de tareas que aplicarán a este proyecto.
                                </p>
                                
                                 <CreateProjectForm
                                    onClose={handleCloseForm}
                                    onCreate={handleFormSubmit}
                                    initialSelectedFases={projectToEdit ? projectToEdit.fases : []} 
                                    isEditingMode={!!projectToEdit} 
                                    onBack={handleBackStep} 
                                    onGoToProject={() => onGoToProject(projectToEdit || formData)} 
                                    actionButtonClass="submit-button"
                                    cancelButtonClass="cancel-button"
                                    backButtonClass="back-button"
                                />
                         </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectList;