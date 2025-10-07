import React, { useState, useEffect } from "react";
// Aquí también se incluye 'motion' de framer-motion si la usas
import { motion } from "framer-motion";
import "./Welcome.css";
// --- ESTRUCTURA DE GRUPOS (Se mantiene consistente) ---
const GRUPOS_DISPONIBLES = [
    {
        nombre: "0. Adquisición y Legalización del Terreno 🇳🇮",
        subfases: [
            "Búsqueda y Pre-selección de Propiedad",
            "Estudio de Títulos y Solvencia Municipal",
            "Elaboración de Promesa de Compra-Venta (Pacto de Cuota)",
            "Contrato Final de Compra-Venta (Escritura Pública)",
            "Pago de Impuestos de Transferencia (ITF)",
            "Inscripción en el Registro Público de la Propiedad (RPP)",
            "Gastos Legales y Honorarios de Notaría",
        ],
    },
    {
        nombre: "1. Planificación, Diseño y Permisos",
        subfases: [
            "Estudios de Suelo y Topografía",
            "Diseño Arquitectónico Final",
            "Obtención de Permisos de Construcción Municipal/Gubernamental",
            "Aprobación de Servicios (Luz, Agua, Drenaje)",
            "Plan de Seguridad e Higiene en Obra",
        ],
    },
    {
        nombre: "2. Obra Gruesa: Estructura y Cimentación",
        subfases: [
            "Limpieza y nivelación del terreno",
            "Excavación",
            "Cimentación y zapatas",
            "Muros de la planta baja",
            "Muros de la planta alta",
            "Techos / Cubiertas",
            "Columnas y vigas",
        ],
    },
    {
        nombre: "3. Instalaciones (Eléctricas, Plomería, Drenaje)",
        subfases: [
            "Instalación Eléctrica",
            "Instalación de Plomería / Agua potable",
            "Sistema de Drenaje",
            "Instalación de Gas / Energía alternativa",
        ],
    },
    {
        nombre: "4. Acabados Interiores",
        subfases: [
            "Pisos y revestimientos interiores",
            "Pintura y acabados de paredes",
            "Colocación de Puertas y ventanas",
            "Techo interior / Plafones",
        ],
    },
    {
        nombre: "5. Acabados Exteriores y Paisajismo",
        subfases: [
            "Fachada y Pintura exterior",
            "Jardinería / Paisajismo",
            "Cercado / Portones",
        ],
    },
    {
        nombre: "6. Espacios y Mobiliario Clave",
        subfases: [
            "Mobiliario de Cocina",
            "Mobiliario y Accesorios de Baños",
            "Acabados Sala / Comedor / Dormitorios",
            "Acabados Garage / Cochera",
        ],
    },
    {
        nombre: "7. Extras y Opcionales",
        subfases: [
            "Construcción de Alberca / Piscina",
            "Construcción de Cabaña / Establo para caballos",
            "Construcción de Terraza / Patio",
            "Área de BBQ / Asador",
            "Construcción de Gimnasio",
            "Cuarto de máquinas / Bodega",
        ],
    },
    {
        nombre: "8. Cierre, Control de Calidad y Legal",
        subfases: [
            "Control de Calidad (Inspecciones)",
            "Manejo de Residuos y Escombros",
            "Limpieza Fina de Obra",
            "Manuales de Usuario y Garantías",
            "Declaratoria de Obra Terminada / Final de Obra (Habitabilidad)",
        ],
    },
];

// 🔑 Recibir la nueva prop onGoToProject
const CreateProjectForm = ({ 
    onClose, 
    onCreate, 
    onBack, 
    initialSelectedFases, 
    isEditingMode,
    // 🔑 NUEVA PROP: Recibida desde ProjectList
    onGoToProject, 
    actionButtonClass, 
    cancelButtonClass, 
    backButtonClass 
}) => {
    const [selectedFases, setSelectedFases] = useState(initialSelectedFases);
    const [expandedGroup, setExpandedGroup] = useState(null);

    useEffect(() => {
        // Para que se carguen las fases si estamos editando
        setSelectedFases(initialSelectedFases);
    }, [initialSelectedFases]);

    const toggleFase = (fase) => {
        setSelectedFases(prev => 
            prev.includes(fase) 
                ? prev.filter(f => f !== fase)
                : [...prev, fase]
        );
    };

    const toggleGroup = (nombreGrupo) => {
        setExpandedGroup(expandedGroup === nombreGrupo ? null : nombreGrupo);
    };

    const toggleAllInGroup = (subfases, isSelecting) => {
        setSelectedFases(prev => {
            const newFases = prev.filter(fase => !subfases.includes(fase));
            return isSelecting ? [...newFases, ...subfases] : newFases;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Llama a handleCreateProject o handleSaveEditedPhases en App.jsx
        onCreate(selectedFases); 
        onClose();
    };
    
    // Función de utilidad para ver si todas las subfases de un grupo están seleccionadas
    const areAllSelected = (subfases) => subfases.every(fase => selectedFases.includes(fase));

    return (
        <form onSubmit={handleSubmit}>
            
            {/* 🔑 LISTA DE FASES Y GRUPOS */}
            <div className="phases-list-container">
                {GRUPOS_DISPONIBLES.map((group) => {
                    const isExpanded = expandedGroup === group.nombre;
                    const allSelected = areAllSelected(group.subfases);

                    return (
                        <div key={group.nombre} className="phase-group-item">
                            
                            <button
                                type="button"
                                className={`group-toggle-button ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleGroup(group.nombre)}
                            >
                                <span>{group.nombre}</span>
                                <span className="arrow">
                                    {isExpanded ? '▲' : '▼'}
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="subphase-list">
                                    <button
                                        type="button"
                                        className="group-select-all-inline"
                                        onClick={() => toggleAllInGroup(group.subfases, !allSelected)}
                                    >
                                        {allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                    </button>

                                    {group.subfases.map((fase) => (
                                        <div 
                                            key={fase} 
                                            className="subphase-checkbox"
                                            onClick={() => toggleFase(fase)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedFases.includes(fase)}
                                                onChange={() => toggleFase(fase)}
                                            />
                                            {fase}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Fin de lista de fases */}
            

            {/* 🔑 BOTONES DE ACCIÓN */}
            <div className="form-actions">
                
                {/* Botón de Atrás */}
                <button 
                    type="button" 
                    className={backButtonClass} 
                    onClick={onBack}
                >
                    &larr; Detalles
                </button>
                
                {/* Contenedor de botones de la derecha */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    
                    {/* 🔑 NUEVO BOTÓN: Solo visible si estamos EDITANDO un proyecto existente */}
                    {isEditingMode && (
                        <button
                            type="button"
                            className="go-to-project-button" // Clase del botón verde (Ir a Proyecto)
                            onClick={onGoToProject}
                        >
                            Ir a Proyecto
                        </button>
                    )}
                    
                    {/* Botón de Acción Principal (Crear o Guardar) */}
                    <button 
                        type="submit" 
                        className={actionButtonClass} 
                        // El submit ahora se hace con el onClick para asegurar el flujo de datos
                        // y el disabled evita enviar un formulario vacío
                        disabled={selectedFases.length === 0}
                    >
                        {isEditingMode ? 'Guardar Cambios' : 'Crear Proyecto'}
                    </button>
                </div>
            </div>

        </form>
    );
};

export default CreateProjectForm;