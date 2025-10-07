// src/components/ProjectBody.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MaterialsInventory from './Material/MaterialsInventory'; 
import { materialCatalog as initialCatalog } from './Material/MaterialsData'; 
import './ProjectBody.css'; 

// --- ESTRUCTURA DE GRUPOS DE FASES --- 
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

// --- ESTRUCTURA DEL MENÚ DE HERRAMIENTAS ---
const HERRAMIENTAS_DISPONIBLES = [
    { name: "Materiales e Inventario", icon: "📦" },
    { name: "Mano de Obra (Personal y Nómina)", icon: "👷" },
    { name: "Maquinaria y Alquiler", icon: "🚜" },
    { name: "Contratos y Servicios", icon: "✍️" },
    { name: "Gastos de Caja Chica (Extra)", icon: "💸" }, 
    { name: "Reportes y Auditoría", icon: "📈" },
];


// --- UTILITY FUNCTIONS ---

const calculateGlobalAvance = (projectData) => { 
    let grandTotalAvanceWeighted = 0; 
    let grandTotalWeight = 0; 
    Object.entries(projectData.faseDetails || {}).forEach(([faseName, detail]) => {
        if (projectData.fases && projectData.fases.includes(faseName) && detail) {
            const costo = parseFloat(detail.costo) || 0; 
            const avance = parseFloat(detail.avance) || 0; 
            grandTotalAvanceWeighted += avance * costo; 
            grandTotalWeight += costo; 
        }
    });
    return grandTotalWeight > 0 
        ? (grandTotalAvanceWeighted / grandTotalWeight).toFixed(0) 
        : 0; 
};

const calculateProjectCost = (projectData) => {
    // 1. PRIORIDAD: Usar la propiedad 'costoTotal' (Presupuesto Global)
    const initialCost = parseFloat(projectData.costoTotal);
    if (!isNaN(initialCost) && initialCost > 0) {
        return initialCost;
    }
    
    // 2. RESPALDO: Si no hay costo global definido, sumar los costos de las fases.
    let grandTotalCost = 0;
    Object.entries(projectData.faseDetails || {}).forEach(([faseName, detail]) => {
        if (projectData.fases && projectData.fases.includes(faseName) && detail) {
            const costo = parseFloat(detail.costo) || 0; 
            grandTotalCost += costo; 
        }
    });
    
    return grandTotalCost;
};

const getInitialActiveGroup = (currentProject) => {
    const selectedFases = currentProject.fases || [];
    
    return GRUPOS_DISPONIBLES.find(group => 
        group.subfases.some(fase => selectedFases.includes(fase))
    )?.nombre || GRUPOS_DISPONIBLES[0].nombre;
};

// --- COMPONENTE PRINCIPAL ---

const ProjectBody = ({ project, onBackToProjects, onSaveProject }) => { 
    
    const [editableProject, setEditableProject] = useState(project);
    const [activeGroup, setActiveGroup] = useState(() => getInitialActiveGroup(project)); 
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const [activeTool, setActiveTool] = useState(null); 
    
    // 🔑 CAMBIO MÍNIMO #1: Inicializar el estado del INVENTARIO desde el objeto 'project'
    const [materialCatalogState, setMaterialCatalogState] = useState(
        project.inventory?.catalog || initialCatalog 
    ); 
    const [inventoryMovementsState, setInventoryMovementsState] = useState(
        project.inventory?.movements || [] // Nuevo estado para los movimientos
    );
    
    // SINCRONIZACIÓN
    useEffect(() => {
        setEditableProject(project); 
        
        // 🔑 CAMBIO MÍNIMO #2: Actualizar los estados del INVENTARIO si el 'project' cambia
        setMaterialCatalogState(project.inventory?.catalog || initialCatalog);
        setInventoryMovementsState(project.inventory?.movements || []);

        const selectedFases = project.fases || [];
        const newActiveGroup = getInitialActiveGroup(project);

        const activeGroupStillExists = GRUPOS_DISPONIBLES.some(group => 
            group.nombre === activeGroup && 
            group.subfases.some(fase => selectedFases.includes(fase))
        );
        
        if (editableProject.id !== project.id || !activeGroupStillExists) {
             setActiveGroup(newActiveGroup);
        }
    }, [project]); 
    
    // 🔑 CAMBIO MÍNIMO #3: Nueva función para guardar el inventario y persistir el proyecto
    const handleSaveInventory = (newCatalog, newMovements) => {
        
        // 1. Actualizar estados locales
        setMaterialCatalogState(newCatalog);
        setInventoryMovementsState(newMovements);
        
        // 2. Crear el nuevo objeto de inventario
        const newInventory = {
            catalog: newCatalog,
            movements: newMovements
        };
        
        // 3. Crear el proyecto actualizado (añadiendo la propiedad 'inventory')
        const updatedProject = {
            ...editableProject, 
            inventory: newInventory, // ¡Esto es clave!
        };
        
        // 4. Llamar a la función del App.js para guardar el proyecto completo
        onSaveProject(updatedProject); 
    };
    
    // LÓGICA DE EVENTOS
    const isGroupActiveInProject = (group) => {
        const selectedFases = editableProject.fases || []; 
        return group.subfases.some(fase => selectedFases.includes(fase));
    };

    const handlePhaseClick = (phaseName) => {
        // En el futuro, esto cargará los detalles de la fase
        setActiveGroup(phaseName);
    };

    const handleToolClick = (toolName) => {
        setIsMenuOpen(false); 
        setActiveTool(toolName); // Activa la herramienta
    };

    const handleBackToDashboard = () => {
        setActiveTool(null); // Vuelve al dashboard principal
    };


    // CÁLCULOS
    const globalAvance = calculateGlobalAvance(editableProject);
    const rawProjectCost = calculateProjectCost(editableProject); 
    
    const projectCost = rawProjectCost > 0 ? 
        rawProjectCost.toLocaleString('es-NI', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
        }) : 
        'N/A';
        
    // MAPA DE ÍCONOS
    const iconMap = {
        "0. Adquisición y Legalización del Terreno 🇳🇮": "📜",
        "1. Planificación, Diseño y Permisos": "📐",
        "2. Obra Gruesa: Estructura y Cimentación": "🏗️",
        "3. Instalaciones (Eléctricas, Plomería, Drenaje)": "🔌",
        "4. Acabados Interiores": "🎨",
        "5. Acabados Exteriores y Paisajismo": "🌳",
        "6. Espacios y Mobiliario Clave": "🛋️",
        "7. Extras y Opcionales": "🏊",
        "8. Cierre, Control de Calidad y Legal": "✅",
    };


    // 🔑 LÓGICA DE RENDERIZADO PRINCIPAL: Muestra la herramienta si está activa
    if (activeTool === "Materiales e Inventario") {
        return (
            <MaterialsInventory 
                onBack={handleBackToDashboard}
                HERRAMIENTAS_DISPONIBLES={HERRAMIENTAS_DISPONIBLES}
                handleToolClick={handleToolClick}
                
                // 🔑 CAMBIO MÍNIMO #4: Pasar el estado de MOVIMIENTOS
                inventoryMovements={inventoryMovementsState} 
                
                // 🔑 CAMBIO MÍNIMO #5: Pasar la función central de guardado
                materialCatalog={materialCatalogState} 
                onSaveInventory={handleSaveInventory} // ¡Reemplaza a setCatalog!
            />
        );
    }
    
    // Renderizado del DASHBOARD DE FASES (Si no hay herramienta activa)
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="project-body-container"
        >
            <header className="project-body-header">
                
                {/* BOTÓN DE CIERRE (X) - Derecha Superior */}
                <button 
                    onClick={onBackToProjects} 
                    className="close-dashboard-button"
                    aria-label="Cerrar proyecto y volver a la lista"
                >
                    &times; 
                </button>
                
                {/* BOTÓN DEL MENÚ HAMBURGUESA - Izquierda Superior */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="hamburger-menu-button"
                    aria-label="Abrir menú de herramientas del proyecto"
                >
                    ☰
                </button>
                
                {/* TÍTULO CON ÍCONO */}
                <h1 className="project-title">
                    <span className="project-title-icon">🗺️</span> 
                    {editableProject.name}
                </h1>
                
                {/* SUMARIO GLOBAL (Avance y Costo) */}
                <div className="global-summary-bar">
                    <div className="summary-item-bar">Avance General: <span className="value-avance">{globalAvance}%</span></div> 
                    <div className="summary-item-bar">Costo Total: <span className="value-costo">{projectCost}</span></div>
                </div>
            </header>
            
            {/* MENÚ DESPLEGABLE (RENDERIZADO CONDICIONAL) */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="tools-dropdown-menu"
                >
                    <div className="menu-title">Herramientas de Gestión</div>
                    {HERRAMIENTAS_DISPONIBLES.map((tool) => (
                        <button
                            key={tool.name}
                            className="tool-menu-item"
                            onClick={() => handleToolClick(tool.name)}
                        >
                            <span className="tool-icon">{tool.icon}</span>
                            {tool.name}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* DASHBOARD DE SELECCIÓN VISUAL (Todas las fases) */}
            <div className="phase-dashboard-menu"> 
                {GRUPOS_DISPONIBLES.map(group => {
                    const isActive = activeGroup === group.nombre;
                    const isEnabled = isGroupActiveInProject(group); 
                    
                    return (
                        <button
                            key={group.nombre}
                            className={`phase-card ${isActive ? 'active' : ''} ${isEnabled ? 'enabled' : 'disabled'}`}
                            
                            onClick={() => {
                                if (isEnabled) {
                                    handlePhaseClick(group.nombre); 
                                }
                            }}
                            disabled={!isEnabled} 
                        >
                            <div className="phase-card-icon">
                                {iconMap[group.nombre] || "⚙️"}
                            </div>
                            
                            <div className="phase-card-title">
                                {group.nombre}
                            </div>
                        </button>
                    );
                })}
            </div>
            
        </motion.div>
    );
};

export default ProjectBody;