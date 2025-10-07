// src/components/Material/InventoryBaseView.jsx (CÓDIGO MODIFICADO - Filtros en Español)

import React, { useState, useMemo, useCallback } from 'react';
import './InventoryDynamicView.css'; 

const InventoryBaseView = ({ allMovements, formatCurrency }) => {
    
    // ESTADOS (SIN CAMBIOS)
    const [groupBy, setGroupBy] = useState(null); 
    const [collapsedGroups, setCollapsedGroups] = useState({}); 

    const getRowClass = (mode) => {
        if (mode === 'Compra') { return 'movement-row-purchase'; } 
        if (mode === 'Venta' || mode === 'Baja') { return 'movement-row-outflow'; }
        return '';
    };

    const groupedMovements = useMemo(() => {
        if (!groupBy) {
            return { ungrouped: allMovements.sort((a, b) => new Date(b.date) - new Date(a.date)) };
        }
        return allMovements.reduce((groups, movement) => {
            let key;
            switch (groupBy) {
                case 'item': key = movement.item; break;
                case 'mode': key = movement.mode; break;
                case 'invoiceId': key = movement.invoiceId || 'SIN FACTURA'; break;
                case 'date': key = movement.date; break;
                default: key = 'ungrouped';
            }
            if (!groups[key]) { groups[key] = []; }
            groups[key].push(movement);
            return groups;
        }, {});
    }, [allMovements, groupBy]);

    const handleGroupByChange = (key) => {
        setGroupBy(prevKey => prevKey === key ? null : key);
        setCollapsedGroups({}); 
    };

    const toggleGroupCollapse = useCallback((groupKey) => {
        setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    }, []);
    
    const groupKeys = Object.keys(groupedMovements).sort((a, b) => {
        return groupBy === 'date' ? new Date(b) - new Date(a) : a.localeCompare(b);
    });
    
    // Definición de todas las columnas y sus títulos
    const columnDefinitions = useMemo(() => ({
        date: { title: 'Fecha', render: (m) => m.date },
        mode: { title: 'Modo', render: (m) => m.mode },
        item: { title: 'Material', render: (m) => m.item },
        quantity: { title: 'Cantidad', render: (m) => `${Math.abs(m.quantity).toFixed(2)} ${m.unit}` },
        costPerUnitUSD: { title: 'Costo Unit. (USD)', render: (m) => formatCurrency(m.costPerUnitUSD || 0) },
        totalCostUSD: { title: 'Costo Total (USD)', render: (m) => formatCurrency(m.totalCostUSD || 0) },
        invoiceId: { title: 'ID/Factura', render: (m) => m.invoiceId || 'N/A' },
    }), [formatCurrency]);

    // Lógica para reordenar las columnas
    const getOrderedColumns = useCallback(() => {
        const columnKeys = Object.keys(columnDefinitions);
        const currentGroupBy = groupBy;

        if (!currentGroupBy) {
            return columnKeys;
        }

        // Mueve la columna de agrupación a la primera posición
        const ordered = columnKeys.filter(key => key !== currentGroupBy);
        ordered.unshift(currentGroupBy);
        return ordered;
    }, [groupBy, columnDefinitions]);


    // Renderiza la celda de resumen de grupo (para cada columna)
    const renderGroupSummaryCell = (columnKey, groupKey, movements, isCollapsed, totalQuantity, avgCostPerUnit, totalCost, modeContext, invoiceContext) => {
        
        const isGroupingColumn = columnKey === groupBy;
        
        // Celdas especiales de resumen (Cantidad, Costo Unit., Costo Total)
        if (columnKey === 'quantity') {
            return <td key={columnKey}>**{totalQuantity.toFixed(2)}** {movements[0].unit}</td>;
        }
        if (columnKey === 'costPerUnitUSD') {
            return <td key={columnKey}>{formatCurrency(avgCostPerUnit)}</td>;
        }
        if (columnKey === 'totalCostUSD') {
            return <td key={columnKey}>**{formatCurrency(totalCost)}**</td>;
        }

        // Celda de la columna de Agrupación (si está agrupado)
        if (isGroupingColumn) {
            // Esta celda siempre mostrará el icono de colapso y el título del grupo
            return (
                <td key={columnKey} className="group-main-cell">
                    <span className="collapse-icon">{isCollapsed ? '▶️' : '🔽'}</span>
                    <span>{columnDefinitions[columnKey].title}: **{groupKey}** </span>
                    <span className="group-item-count"> ({movements.length})</span>
                </td>
            );
        }

        // Celdas de contexto (Fecha, Modo, Material, Factura)
        if (columnKey === 'date') {
            const dateContext = new Set(movements.map(m => m.date)).size > 1 ? 'Múltiples' : movements[0].date;
            return <td key={columnKey}>{dateContext}</td>;
        }
        if (columnKey === 'mode') {
            return <td key={columnKey}>{modeContext}</td>;
        }
        if (columnKey === 'item') {
             return <td key={columnKey}>{new Set(movements.map(m => m.item)).size > 1 ? 'Múltiples' : movements[0].item}</td>;
        }
        if (columnKey === 'invoiceId') {
            return <td key={columnKey}>{invoiceContext}</td>;
        }

        // Celda por defecto (si se agrupa por 'Modo' y la columna es 'Material')
        return <td key={columnKey}></td>; 
    };


    // Obtener las columnas ordenadas para el renderizado
    const orderedColumns = getOrderedColumns();

    // 🔑 Mapeo de claves a nombres en español para los checkboxes
    const filterNames = {
        item: 'Material',
        mode: 'Modo',
        invoiceId: 'Factura',
        date: 'Fecha',
    };

    return (
        <div className="inventory-base-view">
            <h2>Historial de Movimientos</h2>
            <p>Registro detallado de todas las entradas (Compras) y salidas (Ventas/Bajas) de materiales.</p>

            {/* CONTROLES DE AGRUPACIÓN (MODIFICADOS) */}
            <div className="grouping-controls">
                <label>Agrupar por:</label>
                {/* 🔑 USAMOS LAS CLAVES EN INGLÉS PERO MOSTRAMOS EL NOMBRE EN ESPAÑOL */}
                {['item', 'mode', 'invoiceId', 'date'].map(key => (
                    <label key={key} className="grouping-checkbox-label">
                        <input
                            type="checkbox"
                            checked={groupBy === key}
                            onChange={() => handleGroupByChange(key)}
                        />
                        {filterNames[key]} 
                    </label>
                ))}
            </div>
            {/* FIN CONTROLES DE AGRUPACIÓN */}

            {/* CONTENEDOR ÚNICO */}
            <div className="movement-table-container-unified">
                
                <table className="movement-table-unified">
                    
                    {/* ENCABEZADO RENDERIZADO DINÁMICAMENTE */}
                    <thead>
                        <tr>
                            {orderedColumns.map(key => (
                                <th key={key}>{columnDefinitions[key].title}</th>
                            ))}
                        </tr>
                    </thead>
                    
                    {/* CUERPO DE LA TABLA */}
                    <tbody>
                    
                    {groupBy ? (
                        // --- RENDERIZADO AGRUPADO ---
                        groupKeys.map(groupKey => {
                            const movements = groupedMovements[groupKey];
                            const isCollapsed = collapsedGroups[groupKey];
                            
                            // CÁLCULOS DE RESUMEN
                            const totalQuantity = movements.reduce((sum, m) => sum + Math.abs(parseFloat(m.quantity) || 0), 0);
                            const totalCost = movements.reduce((sum, m) => sum + Math.abs(parseFloat(m.totalCostUSD) || 0), 0);
                            const avgCostPerUnit = totalQuantity > 0 ? totalCost / totalQuantity : 0;
                            const modeContext = new Set(movements.map(m => m.mode)).size > 1 ? 'Múltiple' : movements[0].mode;
                            const invoiceContext = new Set(movements.map(m => m.invoiceId)).size > 1 ? 'Múltiple' : movements[0].invoiceId || 'N/A';
                            
                            return (
                                <React.Fragment key={groupKey}>
                                    
                                    {/* FILA DE RESUMEN: Celdas dinámicas usando la misma ordenación */}
                                    <tr className="group-header-row" onClick={() => toggleGroupCollapse(groupKey)}>
                                        {orderedColumns.map(key => 
                                            renderGroupSummaryCell(key, groupKey, movements, isCollapsed, totalQuantity, avgCostPerUnit, totalCost, modeContext, invoiceContext)
                                        )}
                                    </tr>
                                    
                                    {/* Filas de Movimientos */}
                                    {!isCollapsed && movements
                                        .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                                        .map((movement, index) => (
                                        <tr 
                                            key={movement.id || index} 
                                            className={`${getRowClass(movement.mode)} group-item-row`}
                                        >
                                            {/* CELDAS DE DATOS RENDERIZADAS DINÁMICAMENTE */}
                                            {orderedColumns.map(key => (
                                                <td key={key} className={key}>{columnDefinitions[key].render(movement)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // --- RENDERIZADO SIMPLE (Desagrupado) ---
                        groupedMovements.ungrouped.map((movement, index) => (
                            <tr 
                                key={movement.id || index} 
                                className={getRowClass(movement.mode)}
                            >
                                {orderedColumns.map(key => (
                                    <td key={key} className={key}>{columnDefinitions[key].render(movement)}</td>
                                ))}
                            </tr>
                        ))
                    )}
                    
                    {allMovements.length === 0 && (
                         <tr><td colSpan={orderedColumns.length} className="no-movements">No hay movimientos registrados.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryBaseView;