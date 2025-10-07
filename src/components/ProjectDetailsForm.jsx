import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Welcome.css"; 

const ProjectDetailsForm = ({ onClose, onFinalizeCreation, selectedFases }) => {
    const [projectName, setProjectName] = useState("");
    const [owner, setOwner] = useState("");
    const [address, setAddress] = useState("");

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        
        if (!projectName || !owner || !address) {
            return alert("Por favor, completa todos los campos.");
        }

        // Se unen la información del proyecto con las fases seleccionadas
        const newProject = {
            id: Date.now(),
            name: projectName,
            owner: owner,
            address: address,
            fases: selectedFases, // Las fases vienen del formulario anterior
        };

        onFinalizeCreation(newProject);
    };

    return (
        <div className="modal-backdrop-custom">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="create-form-content" 
            >
                <h3 className="form-title">Datos Básicos del Proyecto</h3>

                <form onSubmit={handleDetailsSubmit} className="details-form">
                    
                    <label className="input-label">
                        Nombre del Proyecto:
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="text-input"
                            placeholder="Ej: Casa Residencial La Granja"
                            required
                        />
                    </label>

                    <label className="input-label">
                        Propietario/a del Inmueble:
                        <input
                            type="text"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="text-input"
                            placeholder="Nombre completo del propietario/a"
                            required
                        />
                    </label>

                    <label className="input-label">
                        Dirección del Proyecto:
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="text-input"
                            placeholder="Municipio, Reparto, Número de Casa/Lote"
                            required
                        />
                    </label>
                    
                    <div className="form-actions-details">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="cancel-button"
                        >
                            Volver
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                        >
                            Guardar y Crear Proyecto
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProjectDetailsForm;