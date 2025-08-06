// Configuración global
const CONFIG = {
    APP_NAME: 'Control de Bodega L.A.N.G.',
    VERSION: '1.0.0',
    STORAGE_KEY: 'bodega_data',
    SESSION_KEY: 'bodega_session'
};

// Usuarios predefinidos con roles
const USERS = {
    'zaida': {
        password: CryptoJS.SHA256('ZaidaRassi2024!').toString(),
        name: 'Zaida Rassi',
        role: 'admin',
        email: 'zaida.rassi@lang.com'
    },
    'luis': {
        password: CryptoJS.SHA256('Luis2024!').toString(),
        name: 'Luis',
        role: 'admin',
        email: 'luis@lang.com'
    },
    'carlos': {
        password: CryptoJS.SHA256('Carlos2024').toString(),
        name: 'Carlos',
        role: 'soldadura',
        email: 'carlos@lang.com'
    },
    'esteban': {
        password: CryptoJS.SHA256('Esteban2024').toString(),
        name: 'Esteban',
        role: 'soldadura',
        email: 'esteban@lang.com'
    },
    'alfredo': {
        password: CryptoJS.SHA256('Alfredo2024').toString(),
        name: 'Alfredo',
        role: 'soldadura',
        email: 'alfredo@lang.com'
    },
    'cristian': {
        password: CryptoJS.SHA256('Cristian2024').toString(),
        name: 'Cristian',
        role: 'electrico',
        email: 'cristian@lang.com'
    },
    'matias': {
        password: CryptoJS.SHA256('Matias2024').toString(),
        name: 'Matías',
        role: 'electrico',
        email: 'matias@lang.com'
    },
    'martin': {
        password: CryptoJS.SHA256('Martin2024').toString(),
        name: 'Martín',
        role: 'electrico',
        email: 'martin@lang.com'
    },
    'raul': {
        password: CryptoJS.SHA256('Raul2024').toString(),
        name: 'Raúl',
        role: 'electrico',
        email: 'raul@lang.com'
    },
    'juan': {
        password: CryptoJS.SHA256('Juan2024').toString(),
        name: 'Juan',
        role: 'pintura',
        email: 'juan@lang.com'
    },
    'felipe': {
        password: CryptoJS.SHA256('Felipe2024').toString(),
        name: 'Felipe',
        role: 'pintura',
        email: 'felipe@lang.com'
    },
    'angelica': {
        password: CryptoJS.SHA256('Angelica2024').toString(),
        name: 'Angélica',
        role: 'aseo',
        email: 'angelica@lang.com'
    }
};

// Estado global de la aplicación
let APP_STATE = {
    currentUser: null,
    currentTab: 'solicitar',
    selectedProducts: [],
    scanner: null,
    scannerCallback: null,
    currentProductId: null,
    managementMode: null,
    confirmCallback: null
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

function login(username, password) {
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const user = USERS[username.toLowerCase()];
    
    if (user && user.password === hashedPassword) {
        APP_STATE.currentUser = {
            username: username.toLowerCase(),
            email: user.email,
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
    
    // Actualizar visibilidad de tabs según usuario
    updateTabVisibility();
    
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
            // Solo Zaida puede acceder a la autorización
            if (APP_STATE.currentUser.username === 'zaida') {
                loadPendingRequests();
            } else {
                showTab('solicitar'); // Redirigir a solicitar si no es Zaida
            }
            break;
        case 'entradas':
            loadRecentEntries();
            break;
        case 'gestionar':
            showManagementOptions();
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
    
    // Gestión de inventario
    document.getElementById('add-product').addEventListener('click', showAddProductForm);
    document.getElementById('manage-add-product').addEventListener('click', showAddProductForm);
    document.getElementById('manage-edit-products').addEventListener('click', showEditProductsList);
    document.getElementById('manage-adjust-stock').addEventListener('click', showStockAdjustList);
    document.getElementById('manage-delete-products').addEventListener('click', showDeleteProductsList);
    document.getElementById('cancel-product-form').addEventListener('click', hideProductForm);
    document.getElementById('product-data-form').addEventListener('submit', handleProductFormSubmit);
    document.getElementById('scan-barcode-product').addEventListener('click', () => openScanner(handleProductBarcodeScan));
    
    // Modales
    document.getElementById('confirm-yes').addEventListener('click', handleConfirmYes);
    document.getElementById('confirm-no').addEventListener('click', closeModal);
    document.getElementById('apply-stock-adjust').addEventListener('click', applyStockAdjustment);
    
    // Retiros y historial
    document.getElementById('user-search').addEventListener('input', searchUsers);
    document.getElementById('retiro-product').addEventListener('input', handleRetiroProductSearch);
    document.getElementById('proyecto-product').addEventListener('input', handleProyectoProductSearch);
    document.getElementById('scan-retiro-product').addEventListener('click', () => openScanner(handleRetiroProductScan));
    document.getElementById('scan-proyecto-product').addEventListener('click', () => openScanner(handleProyectoProductScan));
    document.getElementById('process-user-retiro').addEventListener('click', processUserRetiro);
    document.getElementById('process-proyecto-retiro').addEventListener('click', processProyectoRetiro);
    document.getElementById('status-filter').addEventListener('change', filterHistorial);
    document.getElementById('user-filter').addEventListener('change', filterHistorial);
    document.getElementById('date-from').addEventListener('change', filterHistorial);
    document.getElementById('date-to').addEventListener('change', filterHistorial);
}

// Autenticación
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (login(username, password)) {
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
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
        userId: APP_STATE.currentUser.username || APP_STATE.currentUser.email,
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
    
    // Debug: Verificar que la solicitud se está creando
    console.log('Nueva solicitud creada:', request);
    
    DATABASE.requests.push(request);
    saveData();
    
    // Debug: Verificar todas las solicitudes pendientes
    const pendingCount = DATABASE.requests.filter(r => r.status === 'pending').length;
    console.log('Total solicitudes pendientes:', pendingCount);
    console.log('Todas las solicitudes:', DATABASE.requests);
    
    showToast('Solicitud enviada correctamente', 'success');
    hideRequestForms();
    clearSelectedProducts();
    
    // Notificar a admin - Forzar actualización
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
        userId: APP_STATE.currentUser.username || APP_STATE.currentUser.email,
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
    
    // Debug: Verificar que la solicitud se está creando
    console.log('Nueva solicitud con archivo creada:', request);
    
    DATABASE.requests.push(request);
    saveData();
    
    // Debug: Verificar todas las solicitudes pendientes
    const pendingCount = DATABASE.requests.filter(r => r.status === 'pending').length;
    console.log('Total solicitudes pendientes:', pendingCount);
    
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
    
    const isAdmin = APP_STATE.currentUser && APP_STATE.currentUser.role === 'admin';
    
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
            ${isAdmin ? `
                <div class="inventory-item-actions">
                    <button class="btn btn-primary" onclick="editProduct('${product.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-warning" onclick="adjustProductStock('${product.id}')" title="Ajustar Stock">
                        <i class="fas fa-balance-scale"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            ` : ''}
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

// Reportes faltantes
function generateUserWithdrawalsReport() {
    const approvedRequests = DATABASE.requests.filter(r => r.status === 'approved' && r.products.length > 0);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Reporte de Retiros por Usuario', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    // Agrupar por usuario
    const userGroups = {};
    approvedRequests.forEach(request => {
        if (!userGroups[request.userName]) {
            userGroups[request.userName] = [];
        }
        userGroups[request.userName].push(request);
    });
    
    Object.keys(userGroups).forEach(userName => {
        if (y > 240) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(14);
        doc.text(`USUARIO: ${userName}`, 20, y);
        y += 10;
        
        doc.setFontSize(10);
        userGroups[userName].forEach(request => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(`Solicitud #${request.id} - ${formatDateTime(request.approvedAt)}`, 25, y);
            y += 7;
            
            request.products.forEach(product => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`  • ${product.code} - ${product.name}: ${product.quantity} ${product.unit}`, 30, y);
                y += 5;
            });
            y += 3;
        });
        y += 10;
    });
    
    if (Object.keys(userGroups).length === 0) {
        doc.text('No hay retiros registrados', 20, 40);
    }
    
    doc.save('reporte-retiros-usuario.pdf');
}

function generateProjectWithdrawalsReport() {
    const projectRequests = DATABASE.requests.filter(r => 
        r.status === 'approved' && r.requestType === 'proyecto' && r.products.length > 0
    );
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Reporte de Retiros por Proyecto', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    if (projectRequests.length === 0) {
        doc.text('No hay retiros por proyecto registrados', 20, 40);
    } else {
        // Agrupar por proyecto
        const projectGroups = {};
        projectRequests.forEach(request => {
            const projectKey = `${request.projectName} (${request.projectCECO})`;
            if (!projectGroups[projectKey]) {
                projectGroups[projectKey] = [];
            }
            projectGroups[projectKey].push(request);
        });
        
        Object.keys(projectGroups).forEach(projectKey => {
            if (y > 240) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(14);
            doc.text(`PROYECTO: ${projectKey}`, 20, y);
            y += 10;
            
            doc.setFontSize(10);
            projectGroups[projectKey].forEach(request => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(`Solicitante: ${request.userName} - ${formatDateTime(request.approvedAt)}`, 25, y);
                y += 7;
                
                request.products.forEach(product => {
                    if (y > 250) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`  • ${product.code} - ${product.name}: ${product.quantity} ${product.unit}`, 30, y);
                    y += 5;
                });
                y += 3;
            });
            y += 10;
        });
    }
    
    doc.save('reporte-retiros-proyecto.pdf');
}

function generateRequestsReport() {
    const allRequests = DATABASE.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Historial de Solicitudes', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    if (allRequests.length === 0) {
        doc.text('No hay solicitudes registradas', 20, 40);
    } else {
        allRequests.forEach(request => {
            if (y > 240) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.text(`Solicitud #${request.id}`, 20, y);
            
            doc.setFontSize(10);
            doc.text(`Solicitante: ${request.userName}`, 20, y + 7);
            doc.text(`Estado: ${request.status.toUpperCase()}`, 20, y + 14);
            doc.text(`Tipo: ${request.type.toUpperCase()}`, 20, y + 21);
            doc.text(`Fecha: ${formatDateTime(request.createdAt)}`, 100, y + 7);
            
            if (request.projectName) {
                doc.text(`Proyecto: ${request.projectName} (${request.projectCECO})`, 100, y + 14);
            }
            
            if (request.status === 'approved') {
                doc.text(`Aprobado: ${formatDateTime(request.approvedAt)}`, 100, y + 21);
                doc.text(`Por: ${request.approvedBy}`, 100, y + 28);
            } else if (request.status === 'rejected') {
                doc.text(`Rechazado: ${formatDateTime(request.rejectedAt)}`, 100, y + 21);
                doc.text(`Por: ${request.rejectedBy}`, 100, y + 28);
            }
            
            y += 35;
            
            if (request.products && request.products.length > 0) {
                doc.text('Productos:', 25, y);
                y += 7;
                
                request.products.forEach(product => {
                    if (y > 250) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`• ${product.code} - ${product.name}: ${product.quantity} ${product.unit}`, 30, y);
                    y += 5;
                });
            }
            
            if (request.file) {
                doc.text(`Archivo: ${request.file.name}`, 25, y);
                y += 7;
            }
            
            doc.line(20, y + 5, 190, y + 5);
            y += 15;
        });
    }
    
    doc.save('reporte-historial-solicitudes.pdf');
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

// Actualizar visibilidad de tabs según usuario
function updateTabVisibility() {
    if (APP_STATE.currentUser && APP_STATE.currentUser.role === 'admin') {
        // Solo Zaida puede ver el tab de autorización
        const authTab = document.querySelector('[data-tab="autorizar"]');
        if (APP_STATE.currentUser.username === 'zaida') {
            authTab.style.display = 'block';
        } else {
            authTab.style.display = 'none';
        }
    }
}

// Notificaciones
function updateNotifications() {
    // Debug: Verificar usuario actual
    console.log('Usuario actual:', APP_STATE.currentUser);
    
    // Solo Zaida puede ver notificaciones de solicitudes pendientes
    if (APP_STATE.currentUser && APP_STATE.currentUser.role === 'admin' && APP_STATE.currentUser.username === 'zaida') {
        const pendingCount = DATABASE.requests.filter(r => r.status === 'pending').length;
        console.log('Zaida logueada - Solicitudes pendientes:', pendingCount);
        
        document.getElementById('notification-count').textContent = pendingCount;
        document.getElementById('pending-badge').textContent = pendingCount;
        
        if (pendingCount > 0) {
            document.getElementById('notifications').style.display = 'block';
        } else {
            document.getElementById('notifications').style.display = 'none';
        }
    } else {
        console.log('Usuario no es Zaida o no es admin');
        // Otros usuarios no ven notificaciones
        document.getElementById('notifications').style.display = 'none';
    }
    
    // También actualizar visibilidad de tabs
    updateTabVisibility();
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

// ============ GESTIÓN DE INVENTARIO ============

// Mostrar opciones de gestión
function showManagementOptions() {
    hideProductForm();
    hideProductsList();
}

// Agregar nuevo producto
function showAddProductForm() {
    APP_STATE.managementMode = 'add';
    APP_STATE.currentProductId = null;
    document.getElementById('product-form-title').textContent = 'Agregar Nuevo Producto';
    clearProductForm();
    showProductForm();
}

// Mostrar formulario de producto
function showProductForm() {
    hideProductsList();
    document.getElementById('product-form').classList.remove('hidden');
}

// Ocultar formulario de producto
function hideProductForm() {
    document.getElementById('product-form').classList.add('hidden');
    clearProductForm();
}

// Limpiar formulario
function clearProductForm() {
    document.getElementById('product-data-form').reset();
}

// Mostrar lista de productos para editar
function showEditProductsList() {
    APP_STATE.managementMode = 'edit';
    showProductsList('Seleccione un producto para editar');
}

// Mostrar lista de productos para ajuste de stock
function showStockAdjustList() {
    APP_STATE.managementMode = 'adjust';
    showProductsList('Seleccione un producto para ajustar stock');
}

// Mostrar lista de productos para eliminar
function showDeleteProductsList() {
    APP_STATE.managementMode = 'delete';
    showProductsList('Seleccione un producto para eliminar');
}

// Mostrar lista de productos
function showProductsList(title) {
    hideProductForm();
    const container = document.getElementById('products-management-list');
    container.classList.remove('hidden');
    
    let html = `<div style="padding: 1rem; border-bottom: 2px solid var(--primary-color); background: var(--light-color);">
                    <h3>${title}</h3>
                </div>`;
    
    DATABASE.products.forEach(product => {
        const stockStatus = product.stock <= product.minStock ? 'stock-low' : 'stock-ok';
        const actions = getProductActions(product);
        
        html += `
            <div class="product-management-item">
                <div class="product-management-info">
                    <h4>${product.code} - ${product.name}</h4>
                    <p><strong>Tipo:</strong> ${product.type.toUpperCase()} | 
                       <strong>Stock:</strong> <span class="${stockStatus}">${product.stock} ${product.unit}</span> | 
                       <strong>Ubicación:</strong> ${product.location}</p>
                    <small>${product.description}</small>
                </div>
                <div class="product-management-actions">
                    ${actions}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Ocultar lista de productos
function hideProductsList() {
    document.getElementById('products-management-list').classList.add('hidden');
}

// Obtener acciones según el modo
function getProductActions(product) {
    switch (APP_STATE.managementMode) {
        case 'edit':
            return `<button class="btn btn-primary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>`;
        case 'adjust':
            return `<button class="btn btn-warning" onclick="adjustProductStock('${product.id}')">
                        <i class="fas fa-balance-scale"></i> Ajustar Stock
                    </button>`;
        case 'delete':
            return `<button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>`;
        default:
            return '';
    }
}

// Editar producto
function editProduct(productId) {
    const product = DATABASE.products.find(p => p.id === productId);
    if (!product) return;
    
    APP_STATE.managementMode = 'edit';
    APP_STATE.currentProductId = productId;
    
    // Llenar formulario con datos existentes
    document.getElementById('product-form-title').textContent = 'Editar Producto';
    document.getElementById('product-code').value = product.code;
    document.getElementById('product-type').value = product.type;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-unit').value = product.unit;
    document.getElementById('product-location').value = product.location;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-min-stock').value = product.minStock;
    document.getElementById('product-barcode').value = product.barcode || '';
    
    showProductForm();
}

// Ajustar stock de producto
function adjustProductStock(productId) {
    const product = DATABASE.products.find(p => p.id === productId);
    if (!product) return;
    
    APP_STATE.currentProductId = productId;
    
    // Mostrar información del producto
    document.getElementById('stock-product-info').innerHTML = `
        <div class="stock-info-display">
            <h4>${product.code} - ${product.name}</h4>
            <p><strong>Stock Actual:</strong> <span class="current-stock">${product.stock} ${product.unit}</span></p>
            <p><strong>Stock Mínimo:</strong> ${product.minStock} ${product.unit}</p>
            <p><strong>Ubicación:</strong> ${product.location}</p>
        </div>
    `;
    
    // Limpiar campos
    document.getElementById('adjust-quantity').value = '';
    document.getElementById('adjust-reason').value = '';
    document.querySelector('input[name="adjust-type"][value="set"]').checked = true;
    
    document.getElementById('stock-adjust-modal').classList.add('active');
}

// Aplicar ajuste de stock
function applyStockAdjustment() {
    const productId = APP_STATE.currentProductId;
    const product = DATABASE.products.find(p => p.id === productId);
    if (!product) return;
    
    const adjustType = document.querySelector('input[name="adjust-type"]:checked').value;
    const quantity = parseFloat(document.getElementById('adjust-quantity').value);
    const reason = document.getElementById('adjust-reason').value;
    
    if (isNaN(quantity) || quantity < 0) {
        showToast('Ingrese una cantidad válida', 'error');
        return;
    }
    
    if (!reason.trim()) {
        showToast('Ingrese el motivo del ajuste', 'error');
        return;
    }
    
    const oldStock = product.stock;
    let newStock;
    
    switch (adjustType) {
        case 'set':
            newStock = quantity;
            break;
        case 'add':
            newStock = oldStock + quantity;
            break;
        case 'subtract':
            newStock = Math.max(0, oldStock - quantity);
            break;
    }
    
    // Actualizar stock
    product.stock = newStock;
    
    // Registrar ajuste en historial
    DATABASE.stockAdjustments = DATABASE.stockAdjustments || [];
    DATABASE.stockAdjustments.push({
        id: generateId(),
        productId: productId,
        productCode: product.code,
        productName: product.name,
        oldStock: oldStock,
        newStock: newStock,
        adjustType: adjustType,
        quantity: quantity,
        reason: reason,
        adjustedBy: APP_STATE.currentUser.name,
        adjustedAt: new Date().toISOString()
    });
    
    saveData();
    showToast(`Stock ajustado: ${oldStock} → ${newStock} ${product.unit}`, 'success');
    closeModal();
    
    // Refrescar lista si está visible
    if (APP_STATE.managementMode === 'adjust') {
        showStockAdjustList();
    }
    
    // Refrescar inventario si está activo
    if (APP_STATE.currentTab === 'inventario') {
        loadInventory();
    }
}

// Eliminar producto
function deleteProduct(productId) {
    const product = DATABASE.products.find(p => p.id === productId);
    if (!product) return;
    
    showConfirmDialog(
        'Eliminar Producto',
        `¿Está seguro de eliminar el producto "${product.code} - ${product.name}"?\n\nEsta acción no se puede deshacer.`,
        () => {
            // Eliminar producto
            DATABASE.products = DATABASE.products.filter(p => p.id !== productId);
            saveData();
            showToast('Producto eliminado correctamente', 'success');
            
            // Refrescar lista
            if (APP_STATE.managementMode === 'delete') {
                showDeleteProductsList();
            }
            
            // Refrescar inventario si está activo
            if (APP_STATE.currentTab === 'inventario') {
                loadInventory();
            }
        }
    );
}

// Manejar envío del formulario de producto
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        code: document.getElementById('product-code').value.trim().toUpperCase(),
        type: document.getElementById('product-type').value,
        name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        unit: document.getElementById('product-unit').value,
        location: document.getElementById('product-location').value.trim(),
        stock: parseFloat(document.getElementById('product-stock').value),
        minStock: parseFloat(document.getElementById('product-min-stock').value),
        barcode: document.getElementById('product-barcode').value.trim()
    };
    
    // Validaciones
    if (!formData.code || !formData.type || !formData.name || !formData.unit || 
        !formData.location || isNaN(formData.stock) || isNaN(formData.minStock)) {
        showToast('Complete todos los campos obligatorios', 'error');
        return;
    }
    
    if (formData.stock < 0 || formData.minStock < 0) {
        showToast('Las cantidades no pueden ser negativas', 'error');
        return;
    }
    
    // Verificar código único (solo para productos nuevos o si se cambió el código)
    const existingProduct = DATABASE.products.find(p => p.code === formData.code && p.id !== APP_STATE.currentProductId);
    if (existingProduct) {
        showToast('Ya existe un producto con ese código', 'error');
        return;
    }
    
    // Verificar código de barras único (si se proporciona)
    if (formData.barcode) {
        const existingBarcode = DATABASE.products.find(p => p.barcode === formData.barcode && p.id !== APP_STATE.currentProductId);
        if (existingBarcode) {
            showToast('Ya existe un producto con ese código de barras', 'error');
            return;
        }
    }
    
    if (APP_STATE.managementMode === 'add') {
        // Agregar nuevo producto
        const newProduct = {
            id: generateId(),
            ...formData,
            createdAt: new Date().toISOString(),
            createdBy: APP_STATE.currentUser.name
        };
        
        DATABASE.products.push(newProduct);
        showToast('Producto agregado correctamente', 'success');
    } else if (APP_STATE.managementMode === 'edit') {
        // Editar producto existente
        const productIndex = DATABASE.products.findIndex(p => p.id === APP_STATE.currentProductId);
        if (productIndex !== -1) {
            DATABASE.products[productIndex] = {
                ...DATABASE.products[productIndex],
                ...formData,
                modifiedAt: new Date().toISOString(),
                modifiedBy: APP_STATE.currentUser.name
            };
            showToast('Producto actualizado correctamente', 'success');
        }
    }
    
    saveData();
    hideProductForm();
    showManagementOptions();
    
    // Refrescar inventario si está activo
    if (APP_STATE.currentTab === 'inventario') {
        loadInventory();
    }
}

// Escanear código de barras para producto
function handleProductBarcodeScan(code) {
    document.getElementById('product-barcode').value = code;
    showToast('Código de barras escaneado', 'success');
}

// Mostrar diálogo de confirmación
function showConfirmDialog(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    APP_STATE.confirmCallback = callback;
    document.getElementById('confirm-modal').classList.add('active');
}

// Manejar confirmación
function handleConfirmYes() {
    if (APP_STATE.confirmCallback) {
        APP_STATE.confirmCallback();
        APP_STATE.confirmCallback = null;
    }
    closeModal();
}

// Agregar botones de edición en inventario (solo para admin)
function addInventoryEditButtons() {
    if (APP_STATE.currentUser && APP_STATE.currentUser.role === 'admin') {
        const inventoryItems = document.querySelectorAll('.inventory-item');
        inventoryItems.forEach(item => {
            const productCode = item.querySelector('.item-code').textContent;
            const product = DATABASE.products.find(p => p.code === productCode);
            if (product) {
                const actionsHtml = `
                    <div class="inventory-item-actions">
                        <button class="btn btn-primary" onclick="editProduct('${product.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-warning" onclick="adjustProductStock('${product.id}')" title="Ajustar Stock">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                item.insertAdjacentHTML('beforeend', actionsHtml);
            }
        });
    }
}

// ============ FUNCIONES DE RETIROS Y HISTORIAL ============

// Mostrar formulario de retiro por usuario
function showRetiroUsuario() {
    hideRetiroForms();
    document.getElementById('retiro-usuario').classList.remove('hidden');
    clearRetiroUsuarioForm();
}

// Mostrar formulario de retiro por proyecto
function showRetiroProyecto() {
    hideRetiroForms();
    document.getElementById('retiro-proyecto').classList.remove('hidden');
    clearRetiroProyectoForm();
}

// Mostrar historial de solicitudes
function showHistorialSolicitudes() {
    hideRetiroForms();
    document.getElementById('historial-solicitudes').classList.remove('hidden');
    setupHistorialFilters();
    refreshHistorial();
}

// Ocultar todos los formularios de retiro
function hideRetiroForms() {
    document.getElementById('retiro-usuario').classList.add('hidden');
    document.getElementById('retiro-proyecto').classList.add('hidden');
    document.getElementById('historial-solicitudes').classList.add('hidden');
}

// Limpiar formularios
function clearRetiroUsuarioForm() {
    document.getElementById('user-search').value = '';
    document.getElementById('selected-user').value = '';
    document.getElementById('retiro-product').value = '';
    document.getElementById('retiro-quantity').value = '1';
    document.getElementById('retiro-product-info').innerHTML = '';
    document.getElementById('user-search-results').innerHTML = '';
}

function clearRetiroProyectoForm() {
    document.getElementById('proyecto-name').value = '';
    document.getElementById('proyecto-ceco').value = '';
    document.getElementById('proyecto-responsable').value = '';
    document.getElementById('proyecto-product').value = '';
    document.getElementById('proyecto-quantity').value = '1';
    document.getElementById('proyecto-product-info').innerHTML = '';
}

// Búsqueda de usuarios
function searchUsers(e) {
    const query = e.target.value.toLowerCase();
    const results = document.getElementById('user-search-results');
    
    if (query.length < 2) {
        results.innerHTML = '';
        return;
    }
    
    const matches = Object.entries(USERS).filter(([username, user]) => 
        user.name.toLowerCase().includes(query) || username.toLowerCase().includes(query)
    ).map(([username, user]) => ({ username, ...user }));
    
    displayUserResults(matches);
}

function displayUserResults(users) {
    const resultsContainer = document.getElementById('user-search-results');
    
    if (users.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No se encontraron usuarios</div>';
        return;
    }
    
    resultsContainer.innerHTML = users.map(user => `
        <div class="search-result-item" onclick="selectUser('${user.email}', '${user.name}')">
            <div class="user-info">
                <h4>${user.name}</h4>
                <small>${user.email} - ${user.role.toUpperCase()}</small>
            </div>
        </div>
    `).join('');
}

function selectUser(email, name) {
    document.getElementById('selected-user').value = name;
    document.getElementById('user-search').value = '';
    document.getElementById('user-search-results').innerHTML = '';
    APP_STATE.selectedUserEmail = email;
}

// Manejo de productos para retiros
function handleRetiroProductSearch(e) {
    const code = e.target.value;
    displayProductInfo(code, 'retiro-product-info');
}

function handleProyectoProductSearch(e) {
    const code = e.target.value;
    displayProductInfo(code, 'proyecto-product-info');
}

function displayProductInfo(code, containerId) {
    const container = document.getElementById(containerId);
    
    if (!code || code.length < 2) {
        container.innerHTML = '';
        return;
    }
    
    const product = DATABASE.products.find(p => 
        p.code.toLowerCase().includes(code.toLowerCase()) || 
        p.barcode === code
    );
    
    if (product) {
        const stockStatus = product.stock <= product.minStock ? 'stock-low' : 'stock-ok';
        container.innerHTML = `
            <div class="product-info-card">
                <h4>${product.code} - ${product.name}</h4>
                <p><strong>Descripción:</strong> ${product.description}</p>
                <p><strong>Stock disponible:</strong> <span class="${stockStatus}">${product.stock} ${product.unit}</span></p>
                <p><strong>Ubicación:</strong> ${product.location}</p>
            </div>
        `;
    } else {
        container.innerHTML = '<div class="product-info-card error">Producto no encontrado</div>';
    }
}

// Escáner de productos para retiros
function handleRetiroProductScan(code) {
    document.getElementById('retiro-product').value = code;
    displayProductInfo(code, 'retiro-product-info');
    showToast('Producto escaneado', 'success');
}

function handleProyectoProductScan(code) {
    document.getElementById('proyecto-product').value = code;
    displayProductInfo(code, 'proyecto-product-info');
    showToast('Producto escaneado', 'success');
}

// Procesar retiros
function processUserRetiro() {
    const userName = document.getElementById('selected-user').value;
    const userEmail = APP_STATE.selectedUserEmail;
    const productCode = document.getElementById('retiro-product').value;
    const quantity = parseInt(document.getElementById('retiro-quantity').value);
    
    if (!userName || !productCode || !quantity) {
        showToast('Complete todos los campos', 'error');
        return;
    }
    
    const product = DATABASE.products.find(p => p.code === productCode || p.barcode === productCode);
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    if (product.stock < quantity) {
        showToast('Stock insuficiente', 'error');
        return;
    }
    
    // Crear solicitud automática aprobada
    const request = {
        id: generateId(),
        userId: userEmail,
        userName: userName,
        type: 'manual',
        requestType: 'individual',
        projectName: null,
        projectCECO: null,
        products: [{
            id: product.id,
            code: product.code,
            name: product.name,
            quantity: quantity,
            unit: product.unit
        }],
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: APP_STATE.currentUser.name,
        file: null
    };
    
    // Descontar stock
    product.stock -= quantity;
    
    // Registrar solicitud y entrega
    DATABASE.requests.push(request);
    DATABASE.deliveries.push({
        id: generateId(),
        requestId: request.id,
        deliveredBy: APP_STATE.currentUser.name,
        deliveredAt: new Date().toISOString(),
        products: request.products
    });
    
    saveData();
    showToast(`Retiro procesado: ${quantity} ${product.unit} de ${product.name} para ${userName}`, 'success');
    
    // Generar PDF de vale
    generateDeliveryVoucher(request);
    
    // Limpiar formulario
    clearRetiroUsuarioForm();
    
    // Refrescar inventario si está activo
    if (APP_STATE.currentTab === 'inventario') {
        loadInventory();
    }
}

function processProyectoRetiro() {
    const projectName = document.getElementById('proyecto-name').value;
    const projectCECO = document.getElementById('proyecto-ceco').value;
    const responsable = document.getElementById('proyecto-responsable').value;
    const productCode = document.getElementById('proyecto-product').value;
    const quantity = parseInt(document.getElementById('proyecto-quantity').value);
    
    if (!projectName || !projectCECO || !responsable || !productCode || !quantity) {
        showToast('Complete todos los campos', 'error');
        return;
    }
    
    const product = DATABASE.products.find(p => p.code === productCode || p.barcode === productCode);
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    if (product.stock < quantity) {
        showToast('Stock insuficiente', 'error');
        return;
    }
    
    // Crear solicitud automática aprobada
    const request = {
        id: generateId(),
        userId: 'admin@lang.com', // Admin como solicitante para proyectos
        userName: responsable,
        type: 'manual',
        requestType: 'proyecto',
        projectName: projectName,
        projectCECO: projectCECO,
        products: [{
            id: product.id,
            code: product.code,
            name: product.name,
            quantity: quantity,
            unit: product.unit
        }],
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: APP_STATE.currentUser.name,
        file: null
    };
    
    // Descontar stock
    product.stock -= quantity;
    
    // Registrar solicitud y entrega
    DATABASE.requests.push(request);
    DATABASE.deliveries.push({
        id: generateId(),
        requestId: request.id,
        deliveredBy: APP_STATE.currentUser.name,
        deliveredAt: new Date().toISOString(),
        products: request.products
    });
    
    saveData();
    showToast(`Retiro procesado: ${quantity} ${product.unit} de ${product.name} para proyecto ${projectName}`, 'success');
    
    // Generar PDF de vale
    generateDeliveryVoucher(request);
    
    // Limpiar formulario
    clearRetiroProyectoForm();
    
    // Refrescar inventario si está activo
    if (APP_STATE.currentTab === 'inventario') {
        loadInventory();
    }
}

// Historial de solicitudes
function setupHistorialFilters() {
    const userFilter = document.getElementById('user-filter');
    
    // Poblar filtro de usuarios
    const uniqueUsers = [...new Set(DATABASE.requests.map(r => r.userName))];
    userFilter.innerHTML = '<option value="all">Todos los usuarios</option>' +
        uniqueUsers.map(user => `<option value="${user}">${user}</option>`).join('');
}

function refreshHistorial() {
    filterHistorial();
}

function filterHistorial() {
    const statusFilter = document.getElementById('status-filter').value;
    const userFilter = document.getElementById('user-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    let filteredRequests = DATABASE.requests;
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
    }
    
    // Filtrar por usuario
    if (userFilter !== 'all') {
        filteredRequests = filteredRequests.filter(r => r.userName === userFilter);
    }
    
    // Filtrar por fecha
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredRequests = filteredRequests.filter(r => new Date(r.createdAt) >= fromDate);
    }
    
    if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // Incluir todo el día
        filteredRequests = filteredRequests.filter(r => new Date(r.createdAt) <= toDate);
    }
    
    // Ordenar por fecha (más reciente primero)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    displayHistorial(filteredRequests);
}

function displayHistorial(requests) {
    const container = document.getElementById('historial-list');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No se encontraron solicitudes con los filtros aplicados</p>';
        return;
    }
    
    container.innerHTML = requests.map(request => {
        const statusClass = {
            pending: 'status-pending',
            approved: 'status-approved', 
            rejected: 'status-rejected'
        }[request.status] || '';
        
        return `
            <div class="historial-item ${statusClass}">
                <div class="historial-header">
                    <h4>Solicitud #${request.id}</h4>
                    <span class="status-badge ${statusClass}">${request.status.toUpperCase()}</span>
                </div>
                <div class="historial-info">
                    <div class="info-row">
                        <span><strong>Solicitante:</strong> ${request.userName}</span>
                        <span><strong>Fecha:</strong> ${formatDateTime(request.createdAt)}</span>
                    </div>
                    <div class="info-row">
                        <span><strong>Tipo:</strong> ${request.type.toUpperCase()}</span>
                        <span><strong>Modalidad:</strong> ${request.requestType === 'proyecto' ? 'Por Proyecto' : 'Individual'}</span>
                    </div>
                    ${request.projectName ? `
                        <div class="info-row">
                            <span><strong>Proyecto:</strong> ${request.projectName} (${request.projectCECO})</span>
                        </div>
                    ` : ''}
                    ${request.status === 'approved' ? `
                        <div class="info-row">
                            <span><strong>Aprobado por:</strong> ${request.approvedBy}</span>
                            <span><strong>Fecha aprobación:</strong> ${formatDateTime(request.approvedAt)}</span>
                        </div>
                    ` : ''}
                    ${request.status === 'rejected' ? `
                        <div class="info-row">
                            <span><strong>Rechazado por:</strong> ${request.rejectedBy}</span>
                            <span><strong>Fecha rechazo:</strong> ${formatDateTime(request.rejectedAt)}</span>
                        </div>
                    ` : ''}
                </div>
                ${request.products && request.products.length > 0 ? `
                    <div class="historial-products">
                        <strong>Productos:</strong>
                        <ul>
                            ${request.products.map(p => 
                                `<li>${p.code} - ${p.name}: ${p.quantity} ${p.unit}</li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${request.file ? `
                    <div class="historial-file">
                        <strong>Archivo adjunto:</strong> ${request.file.name}
                    </div>
                ` : ''}
                <div class="historial-actions">
                    ${request.status === 'approved' ? `
                        <button class="btn btn-primary" onclick="regenerateVoucher('${request.id}')">
                            <i class="fas fa-file-pdf"></i> Regenerar Vale
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Regenerar vale de entrega
function regenerateVoucher(requestId) {
    const request = DATABASE.requests.find(r => r.id === requestId);
    if (request && request.status === 'approved') {
        generateDeliveryVoucher(request);
        showToast('Vale de retiro regenerado', 'success');
    }
}
