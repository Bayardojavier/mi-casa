// src/components/Material/MaterialsData.js

// ====================================================================
// CONSTANTES GLOBALES
// ====================================================================
// 🔑 TIPO DE CAMBIO OFICIAL (C$ a USD) - Requerido por el compilador
export const EXCHANGE_RATE = 36.60;

// ====================================================================
// CATÁLOGOS DE DATOS
// ====================================================================
// 🔑 Catálogo de Materiales para el formulario de entrada - Requerido por el compilador
export const materialCatalog = [
    { name: 'Cemento Portland Tipo I', units: ['Saco 42.5kg'] },
    { name: 'Varilla de Acero Grado 60', units: ['Unidad 1/2"', 'Unidad 3/8"', 'Unidad 5/8"'] },
    { name: 'Arena Fina de Río', units: ['Metro Cúbico (m³)', 'Saco'] },
    { name: 'Bloque de Concreto', units: ['Unidad (15x20x40cm)'] },
    { name: 'Pintura Acrílica (Galón)', units: ['Galón', 'Bote 5G'] },
];

// ====================================================================
// DATOS INICIALES (SIMULADOS)
// ====================================================================
// DATOS INICIALES DE COMPRAS (FACTURAS REGISTRADAS) - Requerido por el compilador
export const initialMaterialPurchases = [
    {
        invoiceId: 'FAC-2024-001', 
        date: '2024-09-28',
        supplier: 'Ferretería Central S.A.',
        currency: 'USD',
        exchangeRate: 36.60,
        taxRateGlobal: 15,
        totalDiscount: 0.00,
        item: 'Cemento Portland Tipo I',
        unit: 'Saco 42.5kg',
        quantity: 50,
        unitPrice: 12.50, 
        costPerUnitUSD: 14.37, // Calculado con IVA
        totalCostUSD: 718.75, // 50 * 12.50 * 1.15
        status: 'Registrado', 
        id: 'REG-FAC-2024-001-1'
    },
    {
        invoiceId: 'FAC-2024-002', 
        date: '2024-10-01',
        supplier: 'Maderas del Norte',
        currency: 'C$', 
        exchangeRate: 36.60,
        taxRateGlobal: 15,
        totalDiscount: 200.00, // Descuento de 200 C$
        item: 'Varilla de Acero Grado 60',
        unit: 'Unidad 1/2"',
        quantity: 100,
        unitPrice: 280.00, // Precio en Córdobas
        costPerUnitUSD: 8.79, // Costo distribuido
        totalCostUSD: 879.00,
        status: 'Registrado',
        id: 'REG-FAC-2024-002-1'
    },
];

// DATOS INICIALES DE MOVIMIENTOS DE SALIDA/BAJA (Ventas/Desperdicio)
export const initialMaterialSales = [
    // Por ahora vacío
];

// Función temporal de cálculo (si la tenías) - la mantenemos por si la usa otro componente
export const calculateInventory = (purchases, sales) => {
    // ... Lógica de cálculo que haremos después ...
    return []; 
};