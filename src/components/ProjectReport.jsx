import React, { useState, useEffect } from "react"; 
import { motion } from "framer-motion"; 
import "./Welcome.css"; 

// --- ESTRUCTURA DE GRUPOS --- 
// Asegúrate de que esta lista sea idéntica a la que usas en CreateProjectForm.jsx.
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

// --- FUNCIÓN DE INICIALIZACIÓN (Maneja datos antiguos/faltantes) --- 
const initializeFaseData = (project) => { 
    const faseDetails = project.faseDetails || {}; 

    project.fases.forEach(faseName => { 
        if (!faseDetails[faseName]) { 
            faseDetails[faseName] = {}; 
        } 
        
        // Inicializa avance si falta 
        if (typeof faseDetails[faseName].avance === 'undefined') { 
            faseDetails[faseName].avance = 0; 
        } 
        // Inicializa costo si falta (usamos 1000 para que los cálculos ponderados funcionen) 
        if (typeof faseDetails[faseName].costo === 'undefined') { 
            faseDetails[faseName].costo = 1000; 
        } 
    }); 
    return { ...project, faseDetails: faseDetails }; 
}; 

// --- FUNCIÓN DE CÁLCULO INDEPENDIENTE (Usada para inicialización y updates) --- 
const calculateGroupTotals = (projectData) => { 
    const newTotals = {}; 

    GRUPOS_DISPONIBLES.forEach(grupo => { 
        if (!grupo || !Array.isArray(grupo.subfases)) { 
            return; 
        } 

        const groupKey = grupo.nombre; 
        let totalGroupCost = 0; 
        let totalWeight = 0; 
        let totalWeightedAvance = 0; 

        grupo.subfases.forEach(faseName => { 
            const detail = projectData.faseDetails?.[faseName]; 

            if (projectData.fases.includes(faseName) && detail) { 
                const costo = parseFloat(detail.costo) || 0; 
                const avance = parseFloat(detail.avance) || 0; 

                totalGroupCost += costo; 
                totalWeightedAvance += avance * costo; 
                totalWeight += costo; 
            } 
        }); 

        const groupAvance = totalWeight > 0 ? (totalWeightedAvance / totalWeight).toFixed(0) : 0; 

        newTotals[groupKey] = { 
            costo: totalGroupCost.toFixed(2), 
            avance: parseInt(groupAvance), 
        }; 
    }); 
    return newTotals; 
}; 
// ------------------------------------------------------------------ 

// 🔑 AÑADIMOS onGoToBody a las props
const ProjectReport = ({ project, onExit, onSave, onEditProjectStructure, onGoToBody }) => { 
    const initialProject = initializeFaseData(project); 
    const [editableProject, setEditableProject] = useState(initialProject); 
    
    const [totals, setTotals] = useState(() => calculateGroupTotals(initialProject)); 
    
    // isEditing se mantiene en FALSE, ya que el modo edición se movió fuera de este componente.
    const [isEditing, setIsEditing] = useState(false); 

    // El useEffect maneja las actualizaciones de los totales SOLO después de un cambio en los detalles 
    useEffect(() => { 
        setTotals(calculateGroupTotals(editableProject)); 
    }, [editableProject.faseDetails]); 

    // --- MANEJADORES DE CAMBIOS (Mantenidos en modo vista para compatibilidad) --- 
    const handleDetailChange = (faseName, field, value) => { 
        let numericValue = (field === 'avance') ? Math.max(0, Math.min(100, parseInt(value) || 0)) : parseFloat(value) || 0; 
        
        setEditableProject(prev => { 
            const newFaseDetails = { 
                ...prev.faseDetails, 
                [faseName]: { 
                    ...prev.faseDetails[faseName], 
                    [field]: numericValue 
                } 
            }; 
            return { ...prev, faseDetails: newFaseDetails, fasesReport: null }; 
        }); 
    }; 

    const handleSave = () => { 
        onSave(editableProject); 
    }; 
    
    // --- GENERACIÓN DEL REPORTE ESTRUCTURADO EN JSX (Vista Estática) --- 
    const renderStructuredReport = () => { 
        let reportJSX = []; 
        let grandTotalCost = 0; 
        let grandTotalAvanceWeighted = 0; 
        let grandTotalWeight = 0; 

        GRUPOS_DISPONIBLES.forEach((grupo) => { 
            const groupKey = grupo.nombre; 
            const groupTotals = totals[groupKey] || { avance: 0, costo: '0.00' }; 
            
            const selectedSubfases = grupo.subfases.filter(fase => editableProject.fases.includes(fase)); 

            if (selectedSubfases.length > 0) { 
                // Fila del Grupo Principal 
                reportJSX.push( 
                    <div key={groupKey} className="report-group-row"> 
                        <span className="group-name">{groupKey}</span> 
                        <span className="group-avance">{groupTotals.avance}%</span> 
                        <span className="group-costo">${groupTotals.costo}</span> 
                    </div> 
                ); 

                grandTotalCost += parseFloat(groupTotals.costo); 
                grandTotalAvanceWeighted += parseFloat(groupTotals.avance) * parseFloat(groupTotals.costo); 
                grandTotalWeight += parseFloat(groupTotals.costo); 

                // Subfases Detalladas 
                selectedSubfases.forEach(faseName => { 
                    const detail = editableProject.faseDetails?.[faseName]; 

                    if (detail) { 
                        reportJSX.push( 
                            <div key={faseName} className="report-fase-row"> 
                                <span className="fase-name"> &bull; {faseName}</span> 
                                
                                {/* Avance Field: Siempre en modo vista (span) */}
                                <span className="fase-avance">{detail.avance}%</span> 
                                
                                {/* Costo Field: Siempre en modo vista (span) */}
                                <span className="fase-costo">${(parseFloat(detail.costo) || 0).toFixed(2)}</span> 
                            </div> 
                        ); 
                    } 
                }); 
            } 
        }); 
        
        const totalProjectAvance = grandTotalWeight > 0 
            ? (grandTotalAvanceWeighted / grandTotalWeight).toFixed(0) 
            : 0; 

        // Fila del Total General 
        reportJSX.push( 
            <div key="total-general" className="report-total-row"> 
                <span className="total-name">TOTAL GENERAL DEL PROYECTO</span> 
                <span className="total-avance">{totalProjectAvance}%</span> 
                <span className="total-costo">${grandTotalCost.toFixed(2)}</span> 
            </div> 
        ); 

        return reportJSX; 
    }; 


    return ( 
        <div className="modal-backdrop-custom"> 
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }} 
                className="project-report-content" 
            > 
                <h2 className="report-title"> 
                    {editableProject.name} <span className="report-status">{isEditing ? '(EDITANDO)' : ''}</span> 
                </h2> 

                <div className="report-details"> 
                    <p><strong>Propietario/a:</strong> {editableProject.owner}</p> 
                    <p><strong>Dirección:</strong> {editableProject.address}</p> 
                </div> 
                
                <h3 className="report-subtitle"> 
                    Fases, Avance y Costos Estimados 
                </h3> 

                {/* Encabezados de Columna */} 
                <div className="report-header-row"> 
                    <span className="header-name">Fase/Módulo</span> 
                    <span className="header-avance">Avance %</span> 
                    <span className="header-costo">Costo $</span> 
                </div> 

                {/* Área del informe con columnas */} 
                <div className="report-fases-area-columns"> 
                    {renderStructuredReport()} 
                </div> 

                {/* Botones de Acción */} 
                <div className="report-actions"> 
                    
                    {/* Botón de Cerrar */}
                    <button onClick={onExit} className="cancel-button"> 
                        Cerrar Informe 
                    </button> 

                    {/* Botón de Modificar Proyecto */}
                    <button 
                        onClick={onEditProjectStructure} 
                        className="submit-button"
                    > 
                        Modificar Proyecto 
                    </button> 
                    
                    {/* 🔑 TERCER BOTÓN: Llama a la prop onGoToBody */}
                    <button 
                        onClick={onGoToBody} 
                        className="go-to-project-button"
                    > 
                        Ir al Proyecto 
                    </button> 
                </div> 
            </motion.div> 
        </div> 
    ); 
}; 

export default ProjectReport;