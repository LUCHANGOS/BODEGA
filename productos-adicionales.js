// Productos adicionales para cargar en el sistema
// Ejecutar en consola del navegador para agregar más productos de ejemplo

const PRODUCTOS_ADICIONALES = [
    // Materiales de Soldadura
    {
        id: 'MAT-003',
        code: 'MAT-003',
        name: 'Soldadura 6013',
        description: 'Electrodo para soldadura 6013 2.5mm',
        unit: 'kg',
        stock: 35,
        minStock: 15,
        location: 'Estante A-1',
        type: 'material',
        barcode: '789123456790'
    },
    {
        id: 'MAT-004',
        code: 'MAT-004',
        name: 'Disco Corte Metal',
        description: 'Disco de corte para metal 115mm',
        unit: 'unidad',
        stock: 25,
        minStock: 10,
        location: 'Estante A-2',
        type: 'material',
        barcode: '789123456791'
    },
    {
        id: 'MAT-005',
        code: 'MAT-005',
        name: 'Alambre MIG',
        description: 'Alambre para soldadura MIG 0.8mm',
        unit: 'carrete',
        stock: 8,
        minStock: 3,
        location: 'Estante A-3',
        type: 'material',
        barcode: '789123456792'
    },

    // Materiales Eléctricos
    {
        id: 'MAT-006',
        code: 'MAT-006',
        name: 'Cable 14 AWG',
        description: 'Cable eléctrico 14 AWG por metro',
        unit: 'metros',
        stock: 150,
        minStock: 50,
        location: 'Bobina C-2',
        type: 'material',
        barcode: '456789123457'
    },
    {
        id: 'MAT-007',
        code: 'MAT-007',
        name: 'Conduit 3/4"',
        description: 'Tubería conduit metálica 3/4 pulgada',
        unit: 'metros',
        stock: 80,
        minStock: 30,
        location: 'Rack D-1',
        type: 'material',
        barcode: '456789123458'
    },
    {
        id: 'MAT-008',
        code: 'MAT-008',
        name: 'Interruptor 20A',
        description: 'Interruptor termomagnético 20 amperes',
        unit: 'unidad',
        stock: 12,
        minStock: 5,
        location: 'Vitrina E-1',
        type: 'material',
        barcode: '456789123459'
    },

    // Materiales de Pintura
    {
        id: 'MAT-009',
        code: 'MAT-009',
        name: 'Pintura Anticorrosiva',
        description: 'Pintura anticorrosiva roja primer',
        unit: 'litro',
        stock: 20,
        minStock: 8,
        location: 'Bodega F-1',
        type: 'material',
        barcode: '321654987123'
    },
    {
        id: 'MAT-010',
        code: 'MAT-010',
        name: 'Thinner',
        description: 'Thinner para pintura industrial',
        unit: 'litro',
        stock: 15,
        minStock: 5,
        location: 'Bodega F-2',
        type: 'material',
        barcode: '321654987124'
    },
    {
        id: 'MAT-011',
        code: 'MAT-011',
        name: 'Brocha 4"',
        description: 'Brocha para pintura 4 pulgadas',
        unit: 'unidad',
        stock: 10,
        minStock: 4,
        location: 'Estante F-3',
        type: 'material',
        barcode: '321654987125'
    },

    // Materiales de Aseo
    {
        id: 'MAT-012',
        code: 'MAT-012',
        name: 'Detergente Industrial',
        description: 'Detergente para limpieza industrial',
        unit: 'litro',
        stock: 25,
        minStock: 10,
        location: 'Bodega G-1',
        type: 'material',
        barcode: '147258369123'
    },
    {
        id: 'MAT-013',
        code: 'MAT-013',
        name: 'Papel Toalla Industrial',
        description: 'Rollo de papel toalla industrial',
        unit: 'rollo',
        stock: 30,
        minStock: 15,
        location: 'Estante G-2',
        type: 'material',
        barcode: '147258369124'
    },

    // EPP Soldadura
    {
        id: 'EPP-003',
        code: 'EPP-003',
        name: 'Guantes Soldador',
        description: 'Guantes de cuero para soldadura',
        unit: 'par',
        stock: 12,
        minStock: 6,
        location: 'Vitrina B-3',
        type: 'epp',
        barcode: '987654321099'
    },
    {
        id: 'EPP-004',
        code: 'EPP-004',
        name: 'Delantal Soldador',
        description: 'Delantal de cuero para soldadura',
        unit: 'unidad',
        stock: 6,
        minStock: 3,
        location: 'Vitrina B-4',
        type: 'epp',
        barcode: '987654321100'
    },
    {
        id: 'EPP-005',
        code: 'EPP-005',
        name: 'Mangas Soldador',
        description: 'Mangas protectoras para soldadura',
        unit: 'par',
        stock: 8,
        minStock: 4,
        location: 'Vitrina B-5',
        type: 'epp',
        barcode: '987654321101'
    },

    // EPP Eléctrico
    {
        id: 'EPP-006',
        code: 'EPP-006',
        name: 'Casco Dieléctrico',
        description: 'Casco de seguridad dieléctrico',
        unit: 'unidad',
        stock: 10,
        minStock: 5,
        location: 'Vitrina B-6',
        type: 'epp',
        barcode: '987654321102'
    },
    {
        id: 'EPP-007',
        code: 'EPP-007',
        name: 'Botas Dieléctricas',
        description: 'Botas de seguridad dieléctricas',
        unit: 'par',
        stock: 6,
        minStock: 3,
        location: 'Vitrina B-7',
        type: 'epp',
        barcode: '987654321103'
    },
    {
        id: 'EPP-008',
        code: 'EPP-008',
        name: 'Detector de Voltaje',
        description: 'Detector de voltaje sin contacto',
        unit: 'unidad',
        stock: 4,
        minStock: 2,
        location: 'Vitrina B-8',
        type: 'epp',
        barcode: '987654321104'
    },

    // EPP General
    {
        id: 'EPP-009',
        code: 'EPP-009',
        name: 'Lentes Seguridad',
        description: 'Lentes de seguridad transparentes',
        unit: 'unidad',
        stock: 20,
        minStock: 10,
        location: 'Vitrina B-9',
        type: 'epp',
        barcode: '987654321105'
    },
    {
        id: 'EPP-010',
        code: 'EPP-010',
        name: 'Mascarilla N95',
        description: 'Mascarilla respiratoria N95',
        unit: 'unidad',
        stock: 50,
        minStock: 20,
        location: 'Vitrina B-10',
        type: 'epp',
        barcode: '987654321106'
    },
    {
        id: 'EPP-011',
        code: 'EPP-011',
        name: 'Chaleco Reflectivo',
        description: 'Chaleco de seguridad reflectivo',
        unit: 'unidad',
        stock: 15,
        minStock: 8,
        location: 'Vitrina B-11',
        type: 'epp',
        barcode: '987654321107'
    },
    {
        id: 'EPP-012',
        code: 'EPP-012',
        name: 'Protector Auditivo',
        description: 'Protector auditivo tipo copa',
        unit: 'unidad',
        stock: 12,
        minStock: 6,
        location: 'Vitrina B-12',
        type: 'epp',
        barcode: '987654321108'
    },

    // Herramientas y Accesorios
    {
        id: 'MAT-014',
        code: 'MAT-014',
        name: 'Taladro Percutor',
        description: 'Taladro percutor 13mm 800W',
        unit: 'unidad',
        stock: 3,
        minStock: 1,
        location: 'Vitrina H-1',
        type: 'material',
        barcode: '852741963147'
    },
    {
        id: 'MAT-015',
        code: 'MAT-015',
        name: 'Extensión Eléctrica',
        description: 'Extensión eléctrica 25 metros',
        unit: 'unidad',
        stock: 4,
        minStock: 2,
        location: 'Estante H-2',
        type: 'material',
        barcode: '852741963148'
    },
    {
        id: 'MAT-016',
        code: 'MAT-016',
        name: 'Cinta Aislante',
        description: 'Cinta aislante eléctrica negra',
        unit: 'rollo',
        stock: 25,
        minStock: 10,
        location: 'Estante H-3',
        type: 'material',
        barcode: '852741963149'
    }
];

// Función para cargar los productos adicionales
function cargarProductosAdicionales() {
    // Obtener datos actuales
    const datosActuales = JSON.parse(localStorage.getItem('bodega_data') || '{}');
    
    // Agregar productos si no existen
    if (!datosActuales.products) {
        datosActuales.products = [];
    }
    
    PRODUCTOS_ADICIONALES.forEach(producto => {
        // Verificar si el producto ya existe
        const existe = datosActuales.products.find(p => p.id === producto.id);
        if (!existe) {
            datosActuales.products.push(producto);
        }
    });
    
    // Guardar datos actualizados
    localStorage.setItem('bodega_data', JSON.stringify(datosActuales));
    
    console.log(`Se agregaron ${PRODUCTOS_ADICIONALES.length} productos adicionales`);
    console.log('Recarga la página para ver los nuevos productos');
}

// Instrucciones para usar este archivo:
console.log('='.repeat(60));
console.log('PRODUCTOS ADICIONALES PARA SISTEMA DE BODEGA');
console.log('='.repeat(60));
console.log('Para agregar estos productos al sistema:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña "Console"');
console.log('3. Ejecuta: cargarProductosAdicionales()');
console.log('4. Recarga la página');
console.log('='.repeat(60));
