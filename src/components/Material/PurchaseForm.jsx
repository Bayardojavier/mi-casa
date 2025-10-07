// src/components/Material/PurchaseForm.jsx (CÓDIGO MODIFICADO PARA SCROLL DESDE FECHA DE COMPRA)

import React from 'react';
import { FaTrashAlt } from 'react-icons/fa'; 

const PurchaseForm = ({
    newInvoiceHeader,
    currentItem,
    invoiceItems,
    invoiceTotal,
    handleHeaderChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleFinalSubmit,
    materialCatalog = [], 
}) => {

    const calculateItemSubtotalLocal = (itemData) => {
        const quantity = parseFloat(itemData.quantity) || 0; 
        const unitPrice = parseFloat(itemData.unitPrice) || 0;
        return quantity * unitPrice; 
    };

    return (
        <form onSubmit={handleFinalSubmit} className="purchase-form">
            
            {/* ========================================================= */}
            {/* 🔑 ZONA FIJA: TÍTULO, Nº DE FACTURA y PROVEEDOR */}
            {/* ========================================================= */}
            <div className="fixed-header-section">
                
                <div className="form-section-header">Detalles de la Factura</div>
                
                {/* 🔑 SOLO LOS CAMPOS CLAVE PERMANECEN FIJOS */}
                <div className="header-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                        <label>Nº de Factura</label>
                        <input type="text" name="invoiceId" value={newInvoiceHeader.invoiceId} onChange={handleHeaderChange} required />
                    </div>
                    <div className="form-group">
                        <label>Proveedor</label>
                        <input type="text" name="supplier" value={newInvoiceHeader.supplier} onChange={handleHeaderChange} required />
                    </div>
                </div>
            </div>
            {/* ========================================================= */}


            {/* ========================================================= */}
            {/* 🔑 ZONA SCROLLABLE: DESDE FECHA DE COMPRA HASTA EL FINAL */}
            {/* ========================================================= */}
            <div className="scrollable-content-area">
                
                {/* 🔑 CAMPOS RESTANTES DE LA FACTURA (AHORA SCROLLABLES) */}
                <div className="header-grid" style={{ gridTemplateColumns: '1fr 0.5fr 0.5fr' }}>
                    <div className="form-group">
                        <label>Fecha de Compra</label>
                        <input type="date" name="date" value={newInvoiceHeader.date} onChange={handleHeaderChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tasa ($/C$)</label>
                        <input type="number" name="exchangeRate" value={newInvoiceHeader.exchangeRate} onChange={handleHeaderChange} min="1" step="0.01" required />
                    </div>
                    <div className="form-group">
                        <label>Moneda</label>
                        <select name="currency" value={newInvoiceHeader.currency} onChange={handleHeaderChange} required>
                            <option value="C$">C$</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>


                <div className="form-section-header">Añadir Ítem a la Factura</div>

                <div className="add-item-grid">
                    
                    {/* Material */}
                    <div className="form-group item-col-1-wide">
                        <label>Material</label>
                        <select name="item" value={currentItem.item} onChange={handleItemChange}>
                            <option value="">Seleccione Material</option>
                            {materialCatalog.map(mat => (
                                <option key={mat.name} value={mat.name}>{mat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Unidad */}
                    <div className="form-group">
                        <label>Unidad</label>
                        <select name="unit" value={currentItem.unit} onChange={handleItemChange}>
                            <option value="">Unidad</option>
                            {materialCatalog.find(m => m.name === currentItem.item)
                                ?.units 
                                ?.map(u => ( 
                                    <option key={u} value={u}>{u}</option>
                                ))
                            }
                        </select>
                    </div>
                    
                    {/* Cantidad */}
                    <div className="form-group">
                        <label>Cantidad</label>
                        <input type="number" name="quantity" value={currentItem.quantity === 0 ? '' : currentItem.quantity}
                            onChange={handleItemChange} min="0.01" step="0.01" placeholder="0.00"
                        />
                    </div>
                    
                    {/* Precio Unitario */}
                    <div className="form-group">
                        <label>Precio Unitario ({newInvoiceHeader.currency})</label>
                        <input type="number" name="unitPrice" value={currentItem.unitPrice === 0.00 ? '' : currentItem.unitPrice}
                            onChange={handleItemChange} min="0.00" step="0.01" placeholder="0.00"
                        />
                    </div>
                    
                    {/* Botón Añadir Ítem */}
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button 
                            type="button" 
                            onClick={handleAddItem} 
                            className="add-button" 
                            style={{ width: '100%', padding: '10px 0' }}
                        >
                            Añadir
                        </button>
                    </div>
                </div>

                {/* --- TABLA DE ÍTEMS AGREGADOS --- */}
                {invoiceItems.length > 0 && (
                    <>
                        <div className="form-section-header" style={{ marginTop: '20px' }}>
                            Ítems en Factura ({invoiceItems.length})
                        </div>
                        <table className="items-table">
                            <thead>
                                <tr className="sticky-table-header"> 
                                    <th>Material</th><th>Unidad</th><th>Cantidad</th><th>P. Unitario ({newInvoiceHeader.currency})</th><th>Subtotal ({newInvoiceHeader.currency})</th><th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{item.item}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.quantity.toFixed(2)}</td>
                                        <td>{item.unitPrice.toFixed(2)}</td>
                                        <td>{calculateItemSubtotalLocal(item).toFixed(2)}</td>
                                        <td>
                                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="remove-button">
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan="4">Subtotal Bruto</td>
                                    <td>{invoiceTotal.subtotalBruto.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                )}

            </div>
            {/* ========================================================= */}


            {/* --- BOTÓN DE SUBMIT FINAL (Fijo en la parte inferior) --- */}
            <div className="submit-button-container">
                <button 
                    type="submit" 
                    className="submit-button-large" 
                    disabled={invoiceItems.length === 0}
                >
                    Registrar Factura Completa
                </button>
            </div>
        </form>
    );
};

export default PurchaseForm;