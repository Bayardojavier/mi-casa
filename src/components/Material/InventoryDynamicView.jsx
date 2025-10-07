// src/components/Material/InventoryDynamicView.jsx

import React, { useState, useMemo } from 'react';
import { IoChevronDown, IoChevronForward, IoCube, IoCalendar, IoPricetag } from 'react-icons/io5';
import './InventoryDynamicView.css'; 

/**
 * Función auxiliar para calcular totales de movimiento (entradas/salidas) de un grupo.
 */
const calculateGroupTotals = (group) => {
    let totalQuantity = 0;
    let totalCostUSD = 0;
    let totalSalePrice = 0; 

    group.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const costUSD = parseFloat(item.totalCostUSD) || 0;
        const salePrice = parseFloat(item.salePrice) || 0; 

        totalQuantity += quantity;
        totalCostUSD += costUSD;
        // Solo sumar el precio de venta si es una transacción de Venta (Sale)
        totalSalePrice += (item.mode === 'Salida' ? salePrice : 0); 
    });

    return { totalQuantity, totalCostUSD, totalSalePrice };
};

const InventoryDynamicView = ({ allMovements, inventory, formatCurrency }) => {
    
    // Opciones de Agrupación
    const GROUP_OPTIONS = {
        item: { label: 'Material', icon: <IoCube /> },
        invoiceId: { label: 'Factura/ID', icon: <IoPricetag /> },
        date: { label: 'Fecha', icon: <IoCalendar /> },
        mode: { label: 'Tipo (Transacción)', icon: <IoPricetag /> },
    };

    const [groupBy, setGroupBy] = useState('item'); 
    const [expandedGroups, setExpandedGroups] = useState({}); 

    /**
     * FUNCIÓN para obtener la Existencia Actual de un grupo.
     * 🟢 CORREGIDO: Usa el Costo Promedio Ponderado (PPC) y el valor total
     * calculado en el componente padre.
     */
    const getCurrentExistence = (groupName, groupBy) => {
        if (groupBy !== 'item') return null;
        
        const itemExistence = inventory.find(i => i.name === groupName);

        if (!itemExistence) return { total: 0, totalCostUSD: 0, avgCost: 0 };
        
        return { 
            total: itemExistence.total, 
            totalCostUSD: itemExistence.totalValueUSD, // Valor Total del inventario (PPC)
            avgCost: itemExistence.avgCost             // Costo Promedio (PPC)
        };
    };

    /**
     * Lógica principal de Agrupación (Calculada con useMemo para eficiencia).
     */
    const groupedMovements = useMemo(() => {
        if (!groupBy || !GROUP_OPTIONS[groupBy] || allMovements.length === 0) {
            return [{ groupName: 'Todos los Movimientos', items: allMovements, total: calculateGroupTotals(allMovements) }];
        }

        const groups = allMovements.reduce((acc, movement) => {
            let groupKey = movement[groupBy];
            if (groupBy === 'date') {
                 // Truncar la fecha al día si se usa formato ISO (YYYY-MM-DD)
                groupKey = groupKey ? groupKey.substring(0, 10) : 'Sin Clasificar'; 
            } else {
                groupKey = groupKey || 'Sin Clasificar';
            }
            
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(movement);
            return acc;
        }, {});

        return Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .map(groupName => ({
                groupName,
                items: groups[groupName],
                total: calculateGroupTotals(groups[groupName]),
            }));

    }, [allMovements, groupBy, GROUP_OPTIONS]);

    // Handler para expandir/colapsar
    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    return (
        <div className="tab-content inventory-dynamic-view">
            <h3>📈 Historial de Movimientos de Inventario (Tabla Dinámica)</h3>
            <p className="tab-description">Trazabilidad completa de entradas (Compra) y salidas (Venta/Baja). 
            Selecciona una opción para agrupar y ver los totales del movimiento.</p>
            
            <div className="grouping-controls">
                <label>Agrupar por:</label>
                {Object.keys(GROUP_OPTIONS).map(key => (
                    <button
                        key={key}
                        className={`group-option-button ${groupBy === key ? 'active' : ''}`}
                        onClick={() => setGroupBy(key)}
                    >
                        {GROUP_OPTIONS[key].icon} {GROUP_OPTIONS[key].label}
                    </button>
                ))}
            </div>

            <div className="table-responsive">
                <table className="items-table dynamic-movements-table">
                    <thead>
                        <tr>
                            <th className="group-col-header">Grupo</th>
                            <th>ID Transacción/Factura</th>
                            <th>Material</th>
                            <th>Unidad</th>
                            <th className="qty-col">Cantidad Mov.</th>
                            <th className="cost-col">Costo Unit. (USD)</th>
                            <th className="cost-col">Costo Total (USD)</th>
                            <th className="mode-col">Tipo</th>
                            <th className="date-col">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedMovements.length > 0 ? (
                            groupedMovements.map((group, index) => {
                                // Obtener existencia actual si el grupo es por item
                                const existence = getCurrentExistence(group.groupName, groupBy);

                                return (
                                    <React.Fragment key={index}>
                                        
                                        {/* Fila de Encabezado de Grupo y Totales */}
                                        <tr 
                                            className={`group-header-row ${expandedGroups[group.groupName] ? 'expanded' : ''}`} 
                                            onClick={() => toggleGroup(group.groupName)}
                                        >
                                            {/* Título de Grupo (ColSpan 4) */}
                                            <td colSpan="4" className="group-col-title">
                                                <span className="toggle-icon">
                                                    {expandedGroups[group.groupName] ? <IoChevronDown /> : <IoChevronForward />}
                                                </span>
                                                {GROUP_OPTIONS[groupBy].icon} 
                                                <strong> {group.groupName} </strong> 
                                                (Transacciones: {group.items.length})
                                            </td>
                                            
                                            {/* Total Cantidad de MOVIMIENTO (Columna 5) */}
                                            <td className="qty-col total"> 
                                                Mov. Total: **{group.total.totalQuantity.toFixed(2)}**
                                            </td>
                                            
                                            {/* Existencia Actual (Combina Columna 6 y 7) */}
                                            <td colSpan="2" className="cost-col total-summary-existence">
                                                {groupBy === 'item' && existence && existence.total > 0
                                                    ? `Existencia: ${existence.total.toFixed(2)} | Valor: ${formatCurrency(existence.totalCostUSD)} (PPC)`
                                                    : groupBy === 'item' && existence?.total === 0 
                                                        ? 'Existencia: 0.00'
                                                        : ''
                                                }
                                            </td> 
                                            
                                            {/* Total Costo/Venta (Combina Columna 8 y 9) */}
                                            <td colSpan="2" className="date-col total-summary-sale">
                                                Costo Mov: {formatCurrency(group.total.totalCostUSD)} | Venta: {formatCurrency(group.total.totalSalePrice)}
                                            </td> 
                                        </tr>

                                        {/* Filas de Detalle (solo si está expandido) */}
                                        {expandedGroups[group.groupName] && (
                                            group.items
                                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                .map(item => (
                                                    <tr key={item.id} className={`detail-row ${item.quantity < 0 ? 'movement-out' : 'movement-in'}`}>
                                                        <td className="group-col-indent"></td> {/* Columna 1 (Indentado) */}
                                                        <td>{item.invoiceId || 'N/A'}</td> {/* Columna 2 */}
                                                        <td>{item.item}</td> {/* Columna 3 */}
                                                        <td>{item.unit}</td> {/* Columna 4 */}
                                                        <td className="qty-col"> {/* Columna 5 */}
                                                            {item.quantity > 0 ? `+${item.quantity.toFixed(2)}` : item.quantity.toFixed(2)}
                                                        </td>
                                                        <td className="cost-col"> {/* Columna 6 */}
                                                            {formatCurrency(item.costPerUnitUSD || 0)}
                                                        </td>
                                                        <td className="cost-col"> {/* Columna 7 */}
                                                            {formatCurrency(item.totalCostUSD || 0)}
                                                        </td>
                                                        <td className="mode-col">{item.mode}</td> {/* Columna 8 */}
                                                        <td className="date-col">{item.date}</td> {/* Columna 9 */}
                                                    </tr>
                                                ))
                                        )}
                                    </React.Fragment>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="9">No hay movimientos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryDynamicView;