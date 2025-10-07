// src/components/Material/SalesAndDisposalForm.jsx

import React from 'react';

const SalesAndDisposalForm = ({
    newDisposalItem,
    // Asegurado con array vacío por si acaso
    inventory = [], 
    handleDisposalChange,
    handleDisposalSubmit,
    // Valor por defecto para la tasa de cambio (p. ej., 36.50)
    defaultExchangeRate = 36.50 
}) => {
    
    // 🔑 DESESTRUCTURAMOS LOS CAMPOS CON unitPriceLocal y exchangeRate
    const { 
        item, 
        unit, 
        quantity, 
        unitPriceLocal, // Precio en Córdobas
        exchangeRate,   // Tasa de Cambio (C$)
        mode, 
        date 
    } = newDisposalItem;
    
    // 1. Obtener los datos de stock del material seleccionado
    const selectedMaterial = inventory.find(i => i.name === item);
    
    // 2. Lista de unidades con stock positivo para el material seleccionado
    const availableUnits = selectedMaterial 
        ? Object.keys(selectedMaterial.units).filter(u => selectedMaterial.units[u] > 0)
        : [];
        
    // 3. Obtener el stock total para mostrarlo en la etiqueta
    const totalStock = selectedMaterial ? selectedMaterial.total.toFixed(2) : '0.00';

    // 🔑 CÁLCULO DEL PRECIO EN DÓLARES
    const currentExchangeRate = exchangeRate || defaultExchangeRate;
    
    const priceInUSD = (unitPriceLocal && currentExchangeRate && currentExchangeRate > 0)
        ? (parseFloat(unitPriceLocal) / parseFloat(currentExchangeRate)).toFixed(4)
        : '0.0000';

    return (
        <form onSubmit={handleDisposalSubmit} className="purchase-form">
            
            <div className="form-section-header">Información del Movimiento</div>
            
            <div className="header-grid"> 
                
                {/* 🔑 TIPO DE MOVIMIENTO (CORREGIDO) */}
                <div className="form-group">
                    <label>Tipo de Movimiento</label>
                    <div className="radio-group">
                        <label>
                            <input 
                                type="radio" 
                                name="mode" 
                                value="Salida" 
                                checked={mode === 'Salida'} 
                                onChange={handleDisposalChange}
                            />Venta
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="mode" 
                                value="Baja" 
                                checked={mode === 'Baja'} 
                                onChange={handleDisposalChange}
                            />Baja/Desperdicio
                        </label>
                    </div>
                </div>
                
                {/* FECHA */}
                <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" name="date" value={date} onChange={handleDisposalChange} required />
                </div>

                {/* 🔑 CAMPO DE TASA DE CAMBIO (Solo visible en modo Venta/Salida) */}
                {mode === 'Salida' && (
                    <div className="form-group exchange-rate-group">
                        <label>Tasa de Cambio (C$ / $)</label>
                        <input 
                            type="number" 
                            name="exchangeRate" 
                            value={currentExchangeRate === 0 ? '' : currentExchangeRate}
                            onChange={handleDisposalChange} 
                            min="0.01" 
                            step="0.01" 
                            placeholder={defaultExchangeRate}
                            required
                        />
                    </div>
                )}
            </div>
            
            <div className="form-section-header">Material a Retirar</div>
            
            <div className={`add-item-grid ${mode === 'Salida' ? 'grid-sale-mode' : 'grid-disposal-mode'}`}>
                
                {/* Material */}
                <div className="form-group item-col-1-wide">
                    <label>Material (Stock Total: {totalStock})</label>
                    <select name="item" value={item} onChange={handleDisposalChange} required>
                        <option value="">Seleccione Material</option>
                        {inventory.map((mat) => (
                            <option key={mat.name} value={mat.name}>
                                {mat.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Unidad */}
                <div className="form-group">
                    <label>Unidad</label>
                    <select name="unit" value={unit} onChange={handleDisposalChange} required>
                        <option value="">Unidad</option>
                        {availableUnits.map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Cantidad */}
                <div className="form-group">
                    <label>Cantidad (a retirar)</label>
                    <input type="number" name="quantity" value={quantity === 0 ? '' : quantity}
                        onChange={handleDisposalChange} min="0.01" step="0.01" placeholder="0.00" required 
                    />
                </div>
                
                {/* 🔑 PRECIO UNITARIO (Acepta Córdobas) */}
                {mode === 'Salida' && (
                    <div className="form-group price-cordoba-group">
                        <label>Precio de Venta (C$)</label>
                        <input 
                            type="number" 
                            name="unitPriceLocal" 
                            value={unitPriceLocal === 0.00 ? '' : unitPriceLocal}
                            onChange={handleDisposalChange} 
                            min="0.00" step="0.01" 
                            placeholder="0.00" 
                            required 
                        />
                        <small className="calculated-usd">Monto en USD: **${priceInUSD}**</small>
                    </div>
                )}
                
                {/* Botón de Enviar */}
                <div className="form-group disposal-submit-button-group"> 
                    <button type="submit" className="submit-button-large add-button">
                        Registrar {mode === 'Salida' ? 'Venta' : 'Baja'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SalesAndDisposalForm;