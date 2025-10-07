// src/components/Material/CatalogManager.jsx

import React from 'react';

const CatalogManager = ({ 
    newMaterial, 
    materialCatalog, 
    handleNewMaterialChange, 
    handleAddMaterial 
}) => (
    <div className="tab-content">
        <h3 className="section-title">Añadir Nuevo Material al Catálogo</h3>
        <p className="tab-description">Define los materiales y sus unidades de medida para que puedan ser usados en las Compras y Ventas.</p>
        <form className="purchase-form" onSubmit={handleAddMaterial}>
            <div className="catalog-form-grid">
                <div className="form-group">
                    <label>Nombre del Material</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={newMaterial.name}
                        onChange={handleNewMaterialChange} 
                        placeholder="Ej: Ladrillo de Barro" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Unidades de Medida (Separar con comas)</label>
                    <input 
                        type="text" 
                        name="unitInput" 
                        value={newMaterial.unitInput}
                        onChange={handleNewMaterialChange} 
                        placeholder="Ej: Unidad, Docena, M²" 
                        required 
                    />
                </div>
                {/* 🔑 FIX: Quité el style inline para que el botón herede el estilo responsive del CSS. Usaré una nueva clase para el diseño de grid. */}
                <button type="submit" className="submit-button-large add-button catalog-add-button">
                    + Agregar
                </button>
            </div>
        </form>

        <h3 className="section-title" style={{ marginTop: '50px' }}>Catálogo Actual ({materialCatalog.length} Ítems)</h3>
        
        {/* 🔑 CAMBIO CLAVE: Contenedor con scroll propio */}
        <div className="scrollable-table-container"> 
            <table className="items-table">
                <thead>
                    <tr>
                        <th style={{ width: '30%' }}>Nombre</th>
                        <th>Unidades de Medida</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Revertimos el 'index' por 'mat.name' o un ID único si lo tienes, 
                        pero 'index' funciona si no tienes claves únicas */}
                    {materialCatalog.map((mat, index) => (
                        <tr key={index}>
                            <td>{mat.name}</td>
                            <td>{mat.units.join(' | ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
    </div>
);

export default React.memo(CatalogManager);