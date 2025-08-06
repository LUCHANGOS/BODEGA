// Configuración global
const CONFIG = {
    APP_NAME: 'Control de Bodega L.A.N.G.',
    VERSION: '1.0.0',
    STORAGE_KEY: 'bodega_data',
    SESSION_KEY: 'bodega_session'
};

// Usuarios predefinidos con roles
const USERS = {
    'zaida.rassi@lang.com': {
        password: CryptoJS.SHA256('ZaidaRassi2024!').toString(),
        name: 'Zaida Rassi',
        role: 'admin'
    },
    'carlos@lang.com': {
        password: CryptoJS.SHA256('Carlos2024').toString(),
        name: 'Carlos',
        role: 'soldadura'
    },
    'esteban@lang.com': {
        password: CryptoJS.SHA256('Esteban2024').toString(),
        name: 'Esteban',
        role: 'soldadura'
    },
    'alfredo@lang.com': {
        password: CryptoJS.SHA256('Alfredo2024').toString(),
        name: 'Alfredo',
        role: 'soldadura'
    },
    'cristian@lang.com': {
        password: CryptoJS.SHA256('Cristian2024').toString(),
        name: 'Cristian',
        role: 'electrico'
    },
    'matias@lang.com': {
        password: CryptoJS.SHA256('Matias2024').toString(),
        name: 'Matías',
        role: 'electrico'
    },
    'martin@lang.com': {
        password: CryptoJS.SHA256('Martin2024').toString(),
        name: 'Martín',
        role: 'electrico'
    },
    'raul@lang.com': {
        password: CryptoJS.SHA256('Raul2024').toString(),
        name: 'Raúl',
        role: 'electrico'
    },
    'juan@lang.com': {
        password: CryptoJS.SHA256('Juan2024').toString(),
        name: 'Juan',
        role: 'pintura'
    },
    'felipe@lang.com': {
        password: CryptoJS.SHA256('Felipe2024').toString(),
        name: 'Felipe',
        role: 'pintura'
    },
    'angelica@lang.com': {
        password: CryptoJS.SHA256('Angelica2024').toString(),
        name: 'Angélica',
        role: 'aseo'
    }
};

// Estado global de la aplicación
let APP_STATE = {
    currentUser: null,
    currentTab: 'solicitar',
    selectedProducts: [],
    scanner: null,
    scannerCallback: null
};

// Base de datos local (simulada)
let DATABASE = {
    products: [
        {
            id: 'MAT-001',
            code: 'MAT-001',
            name: 'Soldadura 7018',
            description: 'Electrodo para soldadura 7018 3.2mm',
            unit: 'kg',
            stock: 50,
            minStock: 10,
            location: 'Estante A-1',
            type: 'material',
            barcode: '789123456789'
        },
        {
            id: 'EPP-001',
            code: 'EPP-001',
            name: 'Casco Soldador',
            description: 'Casco de soldadura fotosensible',
            unit: 'unidad',
            stock: 5,
            minStock: 2,
            location: 'Vitrina B-2',
            type: 'epp',
            barcode: '123456789012'
        },
        {
            id: 'MAT-002',
            code: 'MAT-002',
            name: 'Cable 12 AWG',
            description: 'Cable eléctrico 12 AWG por metro',
            unit: 'metros',
            stock: 2,
            minStock: 50,
            location: 'Bobina C-1',
            type: 'material',
            barcode: '456789123456'
        },
        {
            id: 'EPP-002',
            code: 'EPP-002',
            name: 'Guantes Dieléctricos',
            description: 'Guantes clase 00 hasta 500V',
            unit: 'par',
            stock: 8,
            minStock: 5,
            location: 'Vitrina B-1',
            type: 'epp',
            barcode: '987654321098'
        }
    ],
    requests: [],
    entries: [],
    deliveries: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    setupEventListeners();
    checkSession();
    setupKeyboardScanner();
}

// Gestión de datos
function loadData() {
    const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (savedData) {
        DATABASE = { ...DATABASE, ...JSON.parse(savedData) };
    }
}

function saveData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(DATABASE));
}

// Gestión de sesión
function checkSession() {
    const session = localStorage.getItem(CONFIG.SESSION_KEY);
    if (session) {
        const userData = JSON.parse(session);
        APP_STATE.currentUser = userData;
        showDashboard();
    } else {
        showLogin();
    }
}

function login(email, password) {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const user = USERS[email];
    
    if (user && user.password === hashedPassword) {
        APP_STATE.currentUser = {
            email: email,
            name: user.name,
            role: user.role
        };
        
        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(APP_STATE.currentUser));
        showDashboard();
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
    APP_STATE.currentUser = null;
    showLogin();
}

// Navegación entre pantallas
function showLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('dashboard-screen').classList.remove('active');
    document.body.classList.remove('admin');
}

function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    
    // Configurar UI según el rol
    if (APP_STATE.currentUser.role === 'admin') {
        document.body.classList.add('admin');
    }
    
    document.getElementById('user-name').textContent = APP_STATE.currentUser.name;
    updateNotifications();
    showTab('solicitar');
}

// Navegación por tabs
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    APP_STATE.currentTab = tabName;
    
    // Cargar contenido específico del tab
    switch (tabName) {
        case 'inventario':
            loadInventory();
            break;
        case 'autorizar':
            loadPendingRequests();
            break;
        case 'entradas':
            loadRecentEntries();
            break;
    }
}

// Event Listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });
    
    // Solicitudes
    document.getElementById('manual-request').addEventListener('click', showManualRequestForm);
    document.getElementById('pdf-request').addEventListener('click', showPDFRequestForm);
    document.getElementById('excel-request').addEventListener('click', showExcelRequestForm);
    
    // Formularios
    document.getElementById('cancel-manual').addEventListener('click', hideRequestForms);
    document.getElementById('cancel-file').addEventListener('click', hideRequestForms);
    document.getElementById('submit-manual').addEventListener('click', submitManualRequest);
    document.getElementById('submit-file').addEventListener('click', submitFileRequest);
    
    // Búsqueda de productos
    document.getElementById('product-search').addEventListener('input', searchProducts);
    document.getElementById('scan-camera').addEventListener('click', () => openScanner(handleProductScan));
    
    // Cambios en tipo de solicitud
    document.querySelectorAll('input[name="request-type"]').forEach(radio => {
        radio.addEventListener('change', toggleProjectInfo);
    });
    
    document.querySelectorAll('input[name="file-request-type"]').forEach(radio => {
        radio.addEventListener('change', toggleFileProjectInfo);
    });
    
    // Inventario
    document.getElementById('inventory-search').addEventListener('input', filterInventory);
    document.getElementById('inventory-scan').addEventListener('click', () => openScanner(handleInventoryScan));
    document.getElementById('download-inventory').addEventListener('click', downloadInventoryPDF);
    
    // Filtros de inventario
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => filterInventoryByType(tab.dataset.filter));
    });
    
    // Entradas
    document.getElementById('entry-scan').addEventListener('click', () => openScanner(handleEntryScan));
    document.getElementById('register-entry').addEventListener('click', registerEntry);
    
    // Reportes
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', () => generateReport(card.dataset.report));
    });
    
    // Modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Subida de archivos
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
}

// Autenticación
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (login(email, password)) {
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = 'Correo o contraseña incorrectos';
    }
}

// Solicitudes
function showManualRequestForm() {
    hideRequestForms();
    document.getElementById('manual-form').classList.remove('hidden');
    clearSelectedProducts();
}

function showPDFRequestForm() {
    hideRequestForms();
    document.getElementById('file-form').classList.remove('hidden');
    document.getElementById('file-form-title').textContent = 'Subir Receta PDF';
    document.getElementById('file-input').accept = '.pdf';
}

function showExcelRequestForm() {
    hideRequestForms();
    document.getElementById('file-form').classList.remove('hidden');
    document.getElementById('file-form-title').textContent = 'Subir Archivo Excel';
    document.getElementById('file-input').accept = '.xls,.xlsx';
}

function hideRequestForms() {
    document.getElementById('manual-form').classList.add('hidden');
    document.getElementById('file-form').classList.add('hidden');
}

function toggleProjectInfo() {
    const isProject = document.querySelector('input[name="request-type"]:checked').value === 'proyecto';
    const projectInfo = document.getElementById('project-info');
    
    if (isProject) {
        projectInfo.classList.remove('hidden');
    } else {
        projectInfo.classList.add('hidden');
    }
}

function toggleFileProjectInfo() {
    const isProject = document.querySelector('input[name="file-request-type"]:checked').value === 'proyecto';
    const projectInfo = document.getElementById('file-project-info');
    
    if (isProject) {
        projectInfo.classList.remove('hidden');
    } else {
        projectInfo.classList.add('hidden');
    }
}

// Búsqueda de productos
function searchProducts(e) {
    const query = e.target.value.toLowerCase();
    const results = document.getElementById('search-results');
    
    if (query.length < 2) {
        results.innerHTML = '';
        return;
    }
    
    const matches = DATABASE.products.filter(product => 
        product.code.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        product.barcode === query
    );
    
    displaySearchResults(matches);
}

function displaySearchResults(products) {
    const resultsContainer = document.getElementById('search-results');
    
    if (products.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No se encontraron productos</div>';
        return;
    }
    
    resultsContainer.innerHTML = products.map(product => `
        <div class="search-result-item" onclick="selectProduct('${product.id}')">
            <div class="product-info">
                <h4>${product.code} - ${product.name}</h4>
                <p>${product.description}</p>
                <small>Ubicación: ${product.location}</small>
            </div>
            <div class="stock-info">
                <div class="${product.stock <= product.minStock ? 'stock-low' : 'stock-ok'}">
                    Stock: ${product.stock} ${product.unit}
                </div>
                <small>Mín: ${product.minStock}</small>
            </div>
        </div>
    `).join('');
}

function selectProduct(productId) {
    const product = DATABASE.products.find(p => p.id === productId);
    if (!product) return;
    
    // Verificar si ya está seleccionado
    const existing = APP_STATE.selectedProducts.find(p => p.id === productId);
    if (existing) {
        showToast('Producto ya seleccionado', 'warning');
        return;
    }
    
    APP_STATE.selectedProducts.push({
        ...product,
        quantity: 1
    });
    
    updateSelectedProducts();
    document.getElementById('product-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function updateSelectedProducts() {
    const container = document.getElementById('selected-items');
    
    if (APP_STATE.selectedProducts.length === 0) {
        container.innerHTML = '<p>No hay productos seleccionados</p>';
        return;
    }
    
    container.innerHTML = APP_STATE.selectedProducts.map(product => `
        <div class="selected-item">
            <div class="product-info">
                <strong>${product.code} - ${product.name}</strong>
                <br>
                <small>Stock disponible: ${product.stock} ${product.unit}</small>
            </div>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                <input type="number" class="quantity-input" value="${product.quantity}" 
                       onchange="setQuantity('${product.id}', this.value)" min="1" max="${product.stock}">
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
                <button class="btn btn-danger" onclick="removeProduct('${product.id}')" 
                        style="margin-left: 10px; padding: 0.25rem 0.5rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function changeQuantity(productId, change) {
    const product = APP_STATE.selectedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const newQuantity = product.quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
        product.quantity = newQuantity;
        updateSelectedProducts();
    }
}

function setQuantity(productId, quantity) {
    const product = APP_STATE.selectedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const qty = parseInt(quantity);
    if (qty >= 1 && qty <= product.stock) {
        product.quantity = qty;
    } else {
        updateSelectedProducts(); // Restaurar valor anterior
    }
}

function removeProduct(productId) {
    APP_STATE.selectedProducts = APP_STATE.selectedProducts.filter(p => p.id !== productId);
    updateSelectedProducts();
}

function clearSelectedProducts() {
    APP_STATE.selectedProducts = [];
    updateSelectedProducts();
}

// Envío de solicitudes
function submitManualRequest() {
    if (APP_STATE.selectedProducts.length === 0) {
        showToast('Seleccione al menos un producto', 'error');
        return;
    }
    
    const requestType = document.querySelector('input[name="request-type"]:checked').value;
    const projectName = document.getElementById('project-name').value;
    const projectCECO = document.getElementById('project-ceco').value;
    
    if (requestType === 'proyecto' && (!projectName || !projectCECO)) {
        showToast('Complete los datos del proyecto', 'error');
        return;
    }
    
    const request = {
        id: generateId(),
        userId: APP_STATE.currentUser.email,
        userName: APP_STATE.currentUser.name,
        type: 'manual',
        requestType: requestType,
        projectName: requestType === 'proyecto' ? projectName : null,
        projectCECO: requestType === 'proyecto' ? projectCECO : null,
        products: [...APP_STATE.selectedProducts],
        status: 'pending',
        createdAt: new Date().toISOString(),
        file: null
    };
    
    DATABASE.requests.push(request);
    saveData();
    
    showToast('Solicitud enviada correctamente', 'success');
    hideRequestForms();
    clearSelectedProducts();
    
    // Notificar a admin
    updateNotifications();
}

function submitFileRequest() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) {
        showToast('Seleccione un archivo', 'error');
        return;
    }
    
    const requestType = document.querySelector('input[name="file-request-type"]:checked').value;
    const projectName = document.getElementById('file-project-name').value;
    const projectCECO = document.getElementById('file-project-ceco').value;
    
    if (requestType === 'proyecto' && (!projectName || !projectCECO)) {
        showToast('Complete los datos del proyecto', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'excel';
    
    const request = {
        id: generateId(),
        userId: APP_STATE.currentUser.email,
        userName: APP_STATE.currentUser.name,
        type: fileType,
        requestType: requestType,
        projectName: requestType === 'proyecto' ? projectName : null,
        projectCECO: requestType === 'proyecto' ? projectCECO : null,
        products: [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        file: {
            name: file.name,
            size: file.size,
            type: file.type
        }
    };
    
    DATABASE.requests.push(request);
    saveData();
    
    showToast('Solicitud enviada correctamente', 'success');
    hideRequestForms();
    fileInput.value = '';
    
    updateNotifications();
}

// Inventario
function loadInventory() {
    displayInventory(DATABASE.products);
}

function displayInventory(products) {
    const container = document.getElementById('inventory-list');
    
    if (products.length === 0) {
        container.innerHTML = '<p>No hay productos en el inventario</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="inventory-item ${product.type} ${product.stock <= product.minStock ? 'low-stock' : ''}">
            <div class="item-header">
                <span class="item-code">${product.code}</span>
                <span class="item-type ${product.type}">${product.type.toUpperCase()}</span>
            </div>
            <div class="item-name">${product.name}</div>
            <div class="item-description">${product.description}</div>
            <div class="item-details">
                <span class="detail-label">Stock:</span>
                <span class="detail-value ${product.stock <= product.minStock ? 'stock-low' : 'stock-ok'}">
                    ${product.stock} ${product.unit}
                </span>
                <span class="detail-label">Mínimo:</span>
                <span class="detail-value">${product.minStock} ${product.unit}</span>
                <span class="detail-label">Ubicación:</span>
                <span class="detail-value">${product.location}</span>
                <span class="detail-label">Código Barras:</span>
                <span class="detail-value">${product.barcode || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function filterInventory(e) {
    const query = e.target.value.toLowerCase();
    let filtered = DATABASE.products;
    
    if (query) {
        filtered = DATABASE.products.filter(product =>
            product.code.toLowerCase().includes(query) ||
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }
    
    displayInventory(filtered);
}

function filterInventoryByType(type) {
    // Actualizar botones activos
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${type}"]`).classList.add('active');
    
    let filtered = DATABASE.products;
    
    switch (type) {
        case 'material':
            filtered = DATABASE.products.filter(p => p.type === 'material');
            break;
        case 'epp':
            filtered = DATABASE.products.filter(p => p.type === 'epp');
            break;
        case 'low-stock':
            filtered = DATABASE.products.filter(p => p.stock <= p.minStock);
            break;
        default:
            filtered = DATABASE.products;
    }
    
    displayInventory(filtered);
}

// Autorización de solicitudes
function loadPendingRequests() {
    const pendingRequests = DATABASE.requests.filter(r => r.status === 'pending');
    displayPendingRequests(pendingRequests);
}

function displayPendingRequests(requests) {
    const container = document.getElementById('pending-requests');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No hay solicitudes pendientes</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-card">
            <div class="request-header">
                <h4>Solicitud #${request.id}</h4>
                <span class="request-type ${request.type}">${request.type.toUpperCase()}</span>
            </div>
            <div class="request-info">
                <div>
                    <strong>Solicitante:</strong><br>
                    ${request.userName}
                </div>
                <div>
                    <strong>Fecha:</strong><br>
                    ${formatDateTime(request.createdAt)}
                </div>
                <div>
                    <strong>Tipo:</strong><br>
                    ${request.requestType === 'proyecto' ? 'Por Proyecto' : 'Individual'}
                </div>
                ${request.projectName ? `
                <div>
                    <strong>Proyecto:</strong><br>
                    ${request.projectName} (${request.projectCECO})
                </div>
                ` : ''}
            </div>
            ${request.products.length > 0 ? `
                <div class="request-products">
                    <h5>Productos:</h5>
                    ${request.products.map(p => `
                        <div>${p.code} - ${p.name} (${p.quantity} ${p.unit})</div>
                    `).join('')}
                </div>
            ` : ''}
            ${request.file ? `
                <div class="request-file">
                    <strong>Archivo:</strong> ${request.file.name}
                </div>
            ` : ''}
            <div class="request-actions">
                <button class="btn btn-success" onclick="approveRequest('${request.id}')">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn btn-danger" onclick="rejectRequest('${request.id}')">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </div>
        </div>
    `).join('');
}

function approveRequest(requestId) {
    const request = DATABASE.requests.find(r => r.id === requestId);
    if (!request) return;
    
    if (request.type === 'manual') {
        // Verificar stock disponible
        const insufficientStock = request.products.filter(p => {
            const product = DATABASE.products.find(prod => prod.id === p.id);
            return !product || product.stock < p.quantity;
        });
        
        if (insufficientStock.length > 0) {
            showToast('Stock insuficiente para algunos productos', 'error');
            return;
        }
        
        // Descontar stock
        request.products.forEach(p => {
            const product = DATABASE.products.find(prod => prod.id === p.id);
            if (product) {
                product.stock -= p.quantity;
            }
        });
    }
    
    request.status = 'approved';
    request.approvedAt = new Date().toISOString();
    request.approvedBy = APP_STATE.currentUser.name;
    
    // Registrar entrega
    DATABASE.deliveries.push({
        id: generateId(),
        requestId: requestId,
        deliveredBy: APP_STATE.currentUser.name,
        deliveredAt: new Date().toISOString(),
        products: request.products
    });
    
    saveData();
    showToast('Solicitud aprobada correctamente', 'success');
    loadPendingRequests();
    updateNotifications();
    
    // Generar PDF de vale
    generateDeliveryVoucher(request);
}

function rejectRequest(requestId) {
    const request = DATABASE.requests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();
    request.rejectedBy = APP_STATE.currentUser.name;
    
    saveData();
    showToast('Solicitud rechazada', 'success');
    loadPendingRequests();
    updateNotifications();
}

// Entradas de productos
function registerEntry() {
    const code = document.getElementById('entry-product-search').value;
    const quantity = parseInt(document.getElementById('entry-quantity').value);
    
    if (!code || !quantity) {
        showToast('Complete todos los campos', 'error');
        return;
    }
    
    const product = DATABASE.products.find(p => p.code === code || p.barcode === code);
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    product.stock += quantity;
    
    DATABASE.entries.push({
        id: generateId(),
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        quantity: quantity,
        enteredBy: APP_STATE.currentUser.name,
        enteredAt: new Date().toISOString()
    });
    
    saveData();
    showToast(`Entrada registrada: +${quantity} ${product.unit}`, 'success');
    
    document.getElementById('entry-product-search').value = '';
    document.getElementById('entry-quantity').value = '';
    
    loadRecentEntries();
    if (APP_STATE.currentTab === 'inventario') {
        loadInventory();
    }
}

function loadRecentEntries() {
    const recentEntries = DATABASE.entries
        .sort((a, b) => new Date(b.enteredAt) - new Date(a.enteredAt))
        .slice(0, 10);
    
    displayRecentEntries(recentEntries);
}

function displayRecentEntries(entries) {
    const container = document.getElementById('entries-list');
    
    if (entries.length === 0) {
        container.innerHTML = '<p>No hay entradas registradas</p>';
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="entry-item">
            <div>
                <strong>${entry.productCode}</strong> - ${entry.productName}<br>
                <small>Cantidad: +${entry.quantity}</small>
            </div>
            <div class="text-right">
                <div>${entry.enteredBy}</div>
                <small>${formatDateTime(entry.enteredAt)}</small>
            </div>
        </div>
    `).join('');
}

// Escáner de códigos
function setupKeyboardScanner() {
    let scanBuffer = '';
    let scanTimeout;
    
    document.addEventListener('keydown', function(e) {
        // Solo procesar si el foco no está en un input
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') return;
        
        // Detectar Enter (fin de escaneo)
        if (e.key === 'Enter') {
            if (scanBuffer.length > 6) { // Códigos de barras típicamente > 6 caracteres
                processBarcodeInput(scanBuffer);
                scanBuffer = '';
            }
            return;
        }
        
        // Agregar carácter al buffer
        if (e.key.length === 1) {
            scanBuffer += e.key;
            
            // Limpiar buffer después de timeout
            clearTimeout(scanTimeout);
            scanTimeout = setTimeout(() => {
                scanBuffer = '';
            }, 100);
        }
    });
}

function processBarcodeInput(barcode) {
    const product = DATABASE.products.find(p => p.barcode === barcode);
    if (product) {
        if (APP_STATE.scannerCallback) {
            APP_STATE.scannerCallback(product.code);
        } else {
            // Auto-completar según el contexto actual
            if (APP_STATE.currentTab === 'solicitar' && !document.getElementById('manual-form').classList.contains('hidden')) {
                document.getElementById('product-search').value = product.code;
                selectProduct(product.id);
            } else if (APP_STATE.currentTab === 'entradas') {
                document.getElementById('entry-product-search').value = product.code;
            } else if (APP_STATE.currentTab === 'inventario') {
                document.getElementById('inventory-search').value = product.code;
                filterInventory({ target: { value: product.code } });
            }
        }
    } else {
        showToast('Código de barras no encontrado', 'error');
    }
}

function openScanner(callback) {
    APP_STATE.scannerCallback = callback;
    document.getElementById('scanner-modal').classList.add('active');
    
    const container = document.getElementById('scanner-container');
    container.innerHTML = `
        <div>
            <p>Posicione el código de barras frente a la cámara</p>
            <div id="qr-reader" style="width: 100%; max-width: 400px; margin: 0 auto;"></div>
        </div>
    `;
    
    if (typeof Html5Qrcode !== 'undefined') {
        APP_STATE.scanner = new Html5Qrcode("qr-reader");
        
        APP_STATE.scanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 150 }
            },
            (decodedText, decodedResult) => {
                callback(decodedText);
                closeScanner();
            },
            (errorMessage) => {
                // Ignorar errores de escaneo continuo
            }
        ).catch(err => {
            console.error('Error iniciando cámara:', err);
            container.innerHTML = `
                <div>
                    <p><i class="fas fa-exclamation-triangle"></i> No se pudo acceder a la cámara</p>
                    <p>Use la pistola de código de barras USB o ingrese el código manualmente</p>
                </div>
            `;
        });
    } else {
        container.innerHTML = `
            <div>
                <p><i class="fas fa-exclamation-triangle"></i> Escáner no disponible</p>
                <p>Use la pistola de código de barras USB o ingrese el código manualmente</p>
            </div>
        `;
    }
}

function closeScanner() {
    if (APP_STATE.scanner) {
        APP_STATE.scanner.stop().catch(err => console.error(err));
        APP_STATE.scanner.clear();
        APP_STATE.scanner = null;
    }
    
    closeModal();
    APP_STATE.scannerCallback = null;
}

function handleProductScan(code) {
    const product = DATABASE.products.find(p => p.code === code || p.barcode === code);
    if (product) {
        selectProduct(product.id);
        showToast(`Producto escaneado: ${product.name}`, 'success');
    } else {
        showToast('Producto no encontrado', 'error');
    }
}

function handleInventoryScan(code) {
    document.getElementById('inventory-search').value = code;
    filterInventory({ target: { value: code } });
}

function handleEntryScan(code) {
    document.getElementById('entry-product-search').value = code;
}

// Modales
function closeModal() {
    if (APP_STATE.scanner) {
        closeScanner();
        return;
    }
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Reportes
function generateReport(reportType) {
    switch (reportType) {
        case 'entradas':
            generateEntriesReport();
            break;
        case 'retiros-usuario':
            generateUserWithdrawalsReport();
            break;
        case 'retiros-proyecto':
            generateProjectWithdrawalsReport();
            break;
        case 'stock-bajo':
            generateLowStockReport();
            break;
        case 'solicitudes':
            generateRequestsReport();
            break;
    }
}

function generateEntriesReport() {
    const entries = DATABASE.entries.sort((a, b) => new Date(b.enteredAt) - new Date(a.enteredAt));
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Reporte de Entradas de Productos', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    entries.forEach(entry => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(`${entry.productCode} - ${entry.productName}`, 20, y);
        doc.text(`Cantidad: +${entry.quantity}`, 20, y + 7);
        doc.text(`Por: ${entry.enteredBy}`, 20, y + 14);
        doc.text(`Fecha: ${formatDateTime(entry.enteredAt)}`, 20, y + 21);
        doc.line(20, y + 25, 190, y + 25);
        y += 35;
    });
    
    doc.save('reporte-entradas.pdf');
}

function generateLowStockReport() {
    const lowStock = DATABASE.products.filter(p => p.stock <= p.minStock);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Reporte de Stock Bajo', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    lowStock.forEach(product => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(`${product.code} - ${product.name}`, 20, y);
        doc.text(`Stock Actual: ${product.stock} ${product.unit}`, 20, y + 7);
        doc.text(`Stock Mínimo: ${product.minStock} ${product.unit}`, 20, y + 14);
        doc.text(`Ubicación: ${product.location}`, 20, y + 21);
        doc.line(20, y + 25, 190, y + 25);
        y += 35;
    });
    
    doc.save('reporte-stock-bajo.pdf');
}

function downloadInventoryPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Inventario Completo - L.A.N.G.', 20, 20);
    
    // Materiales
    const materials = DATABASE.products.filter(p => p.type === 'material');
    if (materials.length > 0) {
        doc.setFontSize(14);
        doc.text('MATERIALES', 20, 40);
        
        let y = 50;
        materials.forEach(product => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`${product.code}`, 20, y);
            doc.text(`${product.name}`, 60, y);
            doc.text(`${product.stock} ${product.unit}`, 130, y);
            doc.text(`Mín: ${product.minStock}`, 160, y);
            doc.text(`${product.location}`, 20, y + 7);
            doc.line(20, y + 10, 190, y + 10);
            y += 20;
        });
    }
    
    // EPP
    const epp = DATABASE.products.filter(p => p.type === 'epp');
    if (epp.length > 0) {
        doc.setFontSize(14);
        doc.text('EQUIPOS DE PROTECCIÓN PERSONAL (EPP)', 20, y + 10);
        y += 20;
        
        epp.forEach(product => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`${product.code}`, 20, y);
            doc.text(`${product.name}`, 60, y);
            doc.text(`${product.stock} ${product.unit}`, 130, y);
            doc.text(`Mín: ${product.minStock}`, 160, y);
            doc.text(`${product.location}`, 20, y + 7);
            doc.line(20, y + 10, 190, y + 10);
            y += 20;
        });
    }
    
    doc.save('inventario-completo.pdf');
}

function generateDeliveryVoucher(request) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('VALE DE RETIRO - L.A.N.G.', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Solicitud #: ${request.id}`, 20, 40);
    doc.text(`Solicitante: ${request.userName}`, 20, 50);
    doc.text(`Entregado por: ${request.approvedBy}`, 20, 60);
    doc.text(`Fecha: ${formatDateTime(request.approvedAt)}`, 120, 40);
    
    if (request.projectName) {
        doc.text(`Proyecto: ${request.projectName}`, 20, 70);
        doc.text(`CECO: ${request.projectCECO}`, 120, 70);
    }
    
    doc.line(20, 80, 190, 80);
    
    let y = 90;
    doc.text('CÓDIGO', 20, y);
    doc.text('DESCRIPCIÓN', 60, y);
    doc.text('CANTIDAD', 130, y);
    doc.text('UNIDAD', 160, y);
    doc.line(20, y + 5, 190, y + 5);
    
    y += 15;
    request.products.forEach(product => {
        doc.text(product.code, 20, y);
        doc.text(product.name.substring(0, 25), 60, y);
        doc.text(product.quantity.toString(), 130, y);
        doc.text(product.unit, 160, y);
        y += 10;
    });
    
    doc.line(20, y + 5, 190, y + 5);
    doc.text('Firma Solicitante: _________________', 20, y + 30);
    doc.text('Firma Bodeguera: _________________', 110, y + 30);
    
    doc.save(`vale-retiro-${request.id}.pdf`);
}

// Notificaciones
function updateNotifications() {
    if (APP_STATE.currentUser && APP_STATE.currentUser.role === 'admin') {
        const pendingCount = DATABASE.requests.filter(r => r.status === 'pending').length;
        document.getElementById('notification-count').textContent = pendingCount;
        document.getElementById('pending-badge').textContent = pendingCount;
        
        if (pendingCount > 0) {
            document.getElementById('notifications').style.display = 'block';
        }
    }
}

// Manejo de archivos
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const label = document.querySelector('.file-label span');
        label.textContent = file.name;
    }
}

// Utilidades
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
