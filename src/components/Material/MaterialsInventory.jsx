// src/components/Material/MaterialsInventory.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; 
import { motion } from 'framer-motion';
import './MaterialsInventory.css'; 
import { EXCHANGE_RATE } from './MaterialsData'; 

import PurchaseForm from './PurchaseForm'; 
import CatalogManager from './CatalogManager';
import SalesAndDisposalForm from './SalesAndDisposalForm'; 
import InventoryBaseView from './InventoryBaseView'; 

const MaterialsInventory = ({ 
    onBack, 
    HERRAMIENTAS_DISPONIBLES, 
    handleToolClick, 
    materialCatalog = [],
    inventoryMovements = [], 
    onSaveInventory
}) => {
    
    // ====================================================================
    // FASE 2: ESTADOS Y REFERENCIAS (Aseguramos que isMenuOpen esté aquí)
    // ====================================================================
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState('Movimientos'); 
    
    const getInitialDate = () => new Date().toISOString().substring(0, 10);

    const [newInvoiceHeader, setNewInvoiceHeader] = useState({
        invoiceId: '', 
        date: getInitialDate(),
        supplier: '',
        currency: 'C$', 
        exchangeRate: EXCHANGE_RATE,
        taxRateGlobal: 15, 
        totalDiscount: 0.00, 
    });
    
    const [newDisposalItem, setNewDisposalItem] = useState({
        item: '',
        unit: '',
        quantity: 0,
        unitPrice: 0.00, 
        mode: 'Sale', 
        date: getInitialDate(),
    });

    const [invoiceItems, setInvoiceItems] = useState([]); 
    
    const [currentItem, setCurrentItem] = useState({
        item: '',
        unit: '',
        quantity: 0,
        unitPrice: 0.00, 
    });

    const [newMaterial, setNewMaterial] = useState({
        name: '',
        unitInput: '', 
    });
    
    // ====================================================================
    // Funciones de Utilidad (formatCurrency, calculateItemSubtotalLocal, invoiceTotal, inventory) 
    // ... (Sin cambios significativos)
    // ====================================================================

    const formatCurrency = useCallback((amount) => 
        amount.toLocaleString('es-NI', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }), []);
    
    const calculateItemSubtotalLocal = useCallback((itemData) => {
        const quantity = parseFloat(itemData.quantity) || 0; 
        const unitPrice = parseFloat(itemData.unitPrice) || 0;
        return quantity * unitPrice; 
    }, []);

    const invoiceTotal = useMemo(() => {
        const rate = parseFloat(newInvoiceHeader.exchangeRate) || EXCHANGE_RATE;
        const currency = newInvoiceHeader.currency;
        const taxRate = parseFloat(newInvoiceHeader.taxRateGlobal) / 100 || 0;
        const discount = parseFloat(newInvoiceHeader.totalDiscount) || 0;

        const subtotalBruto = invoiceItems.reduce((sum, item) => sum + calculateItemSubtotalLocal(item), 0);
        
        let subtotalNeto = subtotalBruto - discount;
        if (subtotalNeto < 0) subtotalNeto = 0; 

        const totalConImpuestosLocal = subtotalNeto * (1 + taxRate); 
        const totalCostUSD = currency === 'C$' ? totalConImpuestosLocal / rate : totalConImpuestosLocal;
        
        return { subtotalBruto, totalLocal: totalConImpuestosLocal, totalCostUSD };
    }, [invoiceItems, newInvoiceHeader, calculateItemSubtotalLocal]);
    
    
    const inventory = useMemo(() => {
        const inventoryMap = {};

        materialCatalog.forEach(mat => {
            if (!inventoryMap[mat.name]) { inventoryMap[mat.name] = { total: 0, totalValueUSD: 0, avgCost: 0, units: {} }; }
            const units = Array.isArray(mat.units) ? mat.units : [mat.unit].filter(Boolean);
            units.forEach(unit => { if (inventoryMap[mat.name].units[unit] === undefined) { inventoryMap[mat.name].units[unit] = 0; }});
        });

        inventoryMovements.forEach(p => { 
            const itemName = p.item;
            const quantity = parseFloat(p.quantity) || 0;
            const totalCostUSD = parseFloat(p.totalCostUSD) || 0; 
            
            if (!inventoryMap[itemName]) { inventoryMap[itemName] = { total: 0, totalValueUSD: 0, avgCost: 0, units: {} }; }
            
            inventoryMap[itemName].total += quantity;
            inventoryMap[itemName].totalValueUSD += totalCostUSD; 

            const currentTotal = inventoryMap[itemName].total;
            const currentValue = inventoryMap[itemName].totalValueUSD;
            
            inventoryMap[itemName].avgCost = currentTotal > 0 ? (currentValue / currentTotal) : 0;
            
            if (inventoryMap[itemName].units[p.unit] !== undefined) { inventoryMap[itemName].units[p.unit] += quantity; }
        });

        return Object.keys(inventoryMap)
            .filter(itemName => inventoryMap[itemName].total > 0 || inventoryMap[itemName].totalValueUSD > 0)
            .map(itemName => ({
                name: itemName,
                units: inventoryMap[itemName].units, 
                total: inventoryMap[itemName].total, 
                avgCost: inventoryMap[itemName].avgCost, 
                totalValueUSD: inventoryMap[itemName].totalValueUSD, 
            }));
    }, [inventoryMovements, materialCatalog]);


    // ====================================================================
    // FASE 7: HANDLERS (Incluyendo el handler para el menú hamburguesa)
    // ====================================================================

    const onToolSelect = (toolName) => {
        handleToolClick(toolName);
        setIsMenuOpen(false);
    };

    const handleHeaderChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewInvoiceHeader(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleItemChange = useCallback((e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value })); 
    }, []);

    const handleAddItem = (e) => {
        const quantity = parseFloat(currentItem.quantity);
        const unitPrice = parseFloat(currentItem.unitPrice);

        if (!currentItem.item || !currentItem.unit || quantity <= 0 || unitPrice <= 0) {
            alert("Por favor, complete Material, Unidad, Cantidad y Precio Unitario con valores válidos.");
            return;
        }

        const newItem = {
            ...currentItem,
            quantity: quantity,
            unitPrice: unitPrice,
            id: Date.now() + Math.random(), 
        };

        setInvoiceItems(prev => [...prev, newItem]);
        setCurrentItem({ item: '', unit: '', quantity: 0, unitPrice: 0.00 });
    };

    const handleRemoveItem = (id) => {
        setInvoiceItems(prev => prev.filter(item => item.id !== id));
    };

    const handleNewMaterialChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewMaterial(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddMaterial = (e) => {
        e.preventDefault();
        
        if (!newMaterial.name || !newMaterial.unitInput) {
            alert('Debe ingresar un nombre de material y al menos una unidad.');
            return;
        }

        const unitsArray = newMaterial.unitInput.split(',').map(unit => unit.trim()).filter(unit => unit.length > 0);

        if (unitsArray.length === 0) {
            alert('Debe especificar al menos una unidad válida.');
            return;
        }

        const newEntry = { name: newMaterial.name, units: unitsArray };
        const updatedCatalog = [...materialCatalog, newEntry];
        
        onSaveInventory(updatedCatalog, inventoryMovements); 
        
        setNewMaterial({ name: '', unitInput: '' });
        alert(`"${newMaterial.name}" agregado al catálogo.`);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();
        
        if (!newInvoiceHeader.invoiceId || invoiceItems.length === 0) {
            alert("Debe ingresar un Número de Factura y al menos un ítem.");
            return;
        }

        const subtotalBrutoLocal = invoiceTotal.subtotalBruto;
        const totalNetoConIVAUSD = invoiceTotal.totalCostUSD;
        const rate = parseFloat(newInvoiceHeader.exchangeRate) || EXCHANGE_RATE;

        const subtotalBrutoUSD = newInvoiceHeader.currency === 'C$' ? subtotalBrutoLocal / rate : subtotalBrutoLocal;
        const factorDistribucion = subtotalBrutoUSD > 0 ? totalNetoConIVAUSD / subtotalBrutoUSD : 0; 
        
        const purchasesToRegister = invoiceItems.map(item => {
            const subtotalLocal = calculateItemSubtotalLocal(item);
            const subtotalUSD = newInvoiceHeader.currency === 'C$' ? subtotalLocal / rate : subtotalLocal;
            
            const totalCostDistributedUSD = subtotalUSD * factorDistribucion; 
            
            return {
                invoiceId: newInvoiceHeader.invoiceId, date: newInvoiceHeader.date, supplier: newInvoiceHeader.supplier,
                currency: newInvoiceHeader.currency, exchangeRate: newInvoiceHeader.exchangeRate, taxRateGlobal: newInvoiceHeader.taxRateGlobal, 
                totalDiscount: newInvoiceHeader.totalDiscount, item: item.item, unit: item.unit, quantity: item.quantity, 
                unitPrice: item.unitPrice, costPerUnitUSD: item.quantity > 0 ? totalCostDistributedUSD / item.quantity : 0, 
                totalCostUSD: totalCostDistributedUSD, 
                status: 'Finalizada', 
                id: `REG-${newInvoiceHeader.invoiceId}-${item.id}`, 
                mode: 'Compra' 
            };
        });

        const updatedMovements = [...inventoryMovements, ...purchasesToRegister];
        
        onSaveInventory(materialCatalog, updatedMovements);
        
        setNewInvoiceHeader({
            invoiceId: '', date: getInitialDate(), supplier: '', 
            currency: 'C$', exchangeRate: EXCHANGE_RATE, taxRateGlobal: 15, totalDiscount: 0.00,
        });
        setInvoiceItems([]);
        setActiveTab('Movimientos');
    };
    
    const handleDisposalChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setNewDisposalItem(prev => {
            if (type === 'radio' && name === 'mode') {
                const newMode = value;
                return {
                    ...prev,
                    mode: newMode,
                    unitPrice: newMode === 'Disposal' ? 0.00 : prev.unitPrice, 
                };
            }
            return { ...prev, [name]: value };
        });
    }, []);

    const handleDisposalSubmit = (e) => {
        e.preventDefault();
        
        const quantity = parseFloat(newDisposalItem.quantity) || 0;
        const mode = newDisposalItem.mode;
        
        if (!newDisposalItem.item || quantity <= 0 || !newDisposalItem.unit || (mode === 'Sale' && newDisposalItem.unitPrice <= 0)) {
            alert("Por favor, complete todos los campos de Venta/Baja.");
            return;
        }
        
        const availableItem = inventory.find(i => i.name === newDisposalItem.item);
        const availableQuantityInUnit = availableItem?.units[newDisposalItem.unit] || 0;
        
        if (availableQuantityInUnit < quantity) {
            alert(`Error: Cantidad insuficiente de ${newDisposalItem.item} en la unidad ${newDisposalItem.unit}. Disponible: ${availableQuantityInUnit.toFixed(2)}.`);
            return;
        }

        const avgCost = availableItem?.avgCost || 0; 
        const totalCostOfOutflow = quantity * avgCost;
        
        const newTransaction = {
            item: newDisposalItem.item,
            unit: newDisposalItem.unit,
            quantity: quantity * -1, 
            date: newDisposalItem.date,
            
            mode: mode === 'Sale' ? 'Venta' : 'Baja', 
            
            costPerUnitUSD: avgCost, 
            totalCostUSD: totalCostOfOutflow * -1, 
            
            unitPrice: mode === 'Sale' ? parseFloat(newDisposalItem.unitPrice) || 0 : 0, 
            id: `OUT-${Date.now() + Math.random()}`, 
            salePrice: mode === 'Sale' ? parseFloat(newDisposalItem.unitPrice) * quantity : 0,
        };
        
        const updatedMovements = [...inventoryMovements, newTransaction];
        
        onSaveInventory(materialCatalog, updatedMovements);

        setNewDisposalItem(prev => ({
            item: '', unit: '', quantity: 0, unitPrice: 0.00, mode: prev.mode,
            date: getInitialDate(),
        }));
        
        setActiveTab('Movimientos');
        alert(`${newDisposalItem.item} registrado como ${mode === 'Sale' ? 'Venta' : 'Baja'} (Retirado: ${quantity}).`);
    };

    // ====================================================================
    // FASE 8: RENDERIZADO DEL CONTENIDO DE LA PESTAÑA
    // ====================================================================

    const renderContent = () => {
        switch (activeTab) {
            case 'Movimientos':
                return (
                    <InventoryBaseView 
                        allMovements={inventoryMovements}
                        formatCurrency={formatCurrency}
                    />
                );
            case 'Compras':
                return (
                    <div className="tab-content">
                        <h3>Registro de Nueva Compra / Factura</h3>
                        <p className="tab-description">Utiliza este formulario para registrar las entradas de material que afectan tu inventario y costos.</p>
                        <PurchaseForm 
                            newInvoiceHeader={newInvoiceHeader}
                            invoiceItems={invoiceItems}
                            currentItem={currentItem}
                            materialCatalog={materialCatalog} 
                            invoiceTotal={invoiceTotal}
                            handleHeaderChange={handleHeaderChange}
                            handleItemChange={handleItemChange}
                            handleAddItem={handleAddItem}
                            handleRemoveItem={handleRemoveItem}
                            handleFinalSubmit={handleFinalSubmit}
                        />
                    </div>
                );
            case 'Ventas':
                return (
                    <div className="tab-content">
                        <h3>Registro de Venta o Baja de Materiales</h3>
                        <p className="tab-description">Registra la salida de material, filtrando por materiales con existencia disponible.</p>
                        <SalesAndDisposalForm 
                            newDisposalItem={newDisposalItem}
                            inventory={inventory} 
                            handleDisposalChange={handleDisposalChange}
                            handleDisposalSubmit={handleDisposalSubmit}
                        />
                    </div>
                );
            case 'Catálogo': 
                return (
                    <CatalogManager 
                        newMaterial={newMaterial}
                        materialCatalog={materialCatalog}
                        handleNewMaterialChange={handleNewMaterialChange}
                        handleAddMaterial={handleAddMaterial}
                    />
                );
            default:
                return null;
        }
    };
    
    // ====================================================================
    // FASE 9: ESTRUCTURA PRINCIPAL DEL COMPONENTE 
    // ====================================================================
    
    return (
        <motion.div 
            initial={{ x: 100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -100, opacity: 0 }} 
            className="materials-inventory-container"
        >
            <header className="module-header">
                {/* BOTÓN HAMBURGUESA */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hamburger-menu-tool-button" aria-label="Abrir menú de navegación de herramientas">☰</button>
                <h2>📦 Materiales e Inventario</h2>
                <button onClick={onBack} className="close-tool-button" aria-label="Cerrar módulo y volver al dashboard principal">&times;</button>
            </header>
            
            {/* 🔑 BLOQUE DEL MENÚ HAMBURGUESA (SIDEBAR) */}
            {isMenuOpen && (
                 <>
                    {/* Overlay para cerrar el menú al hacer clic fuera */}
                    <div className="tools-dropdown-menu-overlay" onClick={() => setIsMenuOpen(false)}/>
                    
                    {/* Contenido del menú lateral */}
                    <motion.div
                        initial={{ x: -300 }} 
                        animate={{ x: 0 }}    
                        exit={{ x: -300 }}    
                        transition={{ type: "tween", duration: 0.2 }}
                        className="tools-dropdown-menu-content" 
                        onClick={(e) => e.stopPropagation()} 
                    > 
                         <div className="menu-title">Navegación de Herramientas</div>
                         <button onClick={() => setIsMenuOpen(false)} className="close-menu-button-mobile">&times;</button>
                        {HERRAMIENTAS_DISPONIBLES.map((tool) => (
                            <button
                                key={tool.name}
                                className="tool-menu-item"
                                onClick={() => onToolSelect(tool.name)} 
                            >
                                <span className="tool-icon">{tool.icon}</span>
                                {tool.name}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}

            {/* --- MENU DE PESTAÑAS (TABS) --- */}
            <nav className="inventory-tab-menu-colored"> 
                {['Movimientos', 'Compras', 'Ventas', 'Catálogo'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab-button-colored ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <div className="module-content">
                {renderContent()}
            </div>
            
        </motion.div>
    );
};

export default MaterialsInventory;