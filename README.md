# Sistema de Control de Bodega L.A.N.G.

Sistema web completo para el control de inventario de materiales y EPP (Equipos de Protección Personal) optimizado para GitHub Pages.

## ✨ Características Principales

### 🔐 **Autenticación Segura**
- Login con correo electrónico y contraseña
- Contraseñas hasheadas con SHA-256
- Roles diferenciados: Admin (Zaida Rassi) y Personal
- Sesiones persistentes

### 👥 **Usuarios Predefinidos**
- **Admin**: zaida.rassi@lang.com / ZaidaRassi2024!
- **Soldadura**: carlos@lang.com, esteban@lang.com, alfredo@lang.com / [Nombre]2024
- **Eléctricos**: cristian@lang.com, matias@lang.com, martin@lang.com, raul@lang.com / [Nombre]2024  
- **Pintura**: juan@lang.com, felipe@lang.com / [Nombre]2024
- **Aseo**: angelica@lang.com / Angelica2024

### 📱 **Diseño Responsive**
- Optimizado para móviles
- Botones táctiles grandes (mínimo 48px)
- Navegación intuitiva
- Funciona perfectamente en celulares

### 📦 **Gestión de Inventario**
- Productos categorizados: Materiales y EPP
- Control de stock actual y mínimo
- Ubicación en bodega
- Códigos de barras
- Alertas de stock bajo

### 🛒 **Solicitudes de Materiales (3 modalidades)**
1. **Manual**: Buscar y seleccionar productos
2. **PDF**: Subir receta en formato PDF
3. **Excel**: Subir archivo con formato de solicitud

### 📊 **Funciones para Solicitudes**
- Solicitudes individuales o por proyecto
- Datos de proyecto: nombre y CECO
- Estado: Pendiente, Aprobada, Rechazada
- Historial completo con trazabilidad

### 📸 **Escaneo de Códigos**
- **Pistola USB**: Compatible con pistolas de código de barras USB (modo teclado)
- **Cámara del celular**: Escaneo con Html5-QRCode
- Auto-completado inteligente según contexto
- Funciona en todos los módulos

### 👨‍💼 **Panel de Administrador (Solo Zaida)**
- Autorizar/rechazar solicitudes
- Registrar entradas de productos
- Generar reportes en PDF
- Descargar inventario completo
- Control total del sistema

### 📈 **Reportes Disponibles**
- Entradas de productos
- Retiros por usuario
- Retiros por proyecto  
- Productos con stock bajo
- Historial de solicitudes
- Inventario completo (PDF descargable)

### 📄 **Vales de Retiro**
- Generación automática en PDF
- Datos completos: solicitante, entregador, fecha
- Detalle de productos y cantidades
- Espacio para firmas manuales

## 🚀 **Instalación y Uso**

### Para GitHub Pages:
1. Subir todos los archivos al repositorio
2. Activar GitHub Pages en configuración
3. Acceder desde cualquier dispositivo

### Para uso local:
1. Abrir `index.html` en un navegador
2. Funciona sin servidor web
3. Los datos se almacenan en localStorage

## 🔧 **Funcionalidades Técnicas**

### **Escaneo de Códigos**
- Detecta automáticamente pistola USB
- Fallback a cámara del celular
- Procesa códigos de 6+ caracteres
- Timeout de 100ms entre caracteres

### **Almacenamiento de Datos**
- localStorage del navegador
- Datos encriptados
- Persistencia entre sesiones
- Backup automático

### **Seguridad**
- Contraseñas nunca en texto plano
- Validación de roles
- Sesiones seguras
- Datos locales únicamente

## 📋 **Flujo de Trabajo Típico**

### **Personal**:
1. Hacer login con credenciales
2. Ir a "Solicitar"
3. Elegir modalidad (Manual/PDF/Excel)
4. Completar solicitud
5. Enviar para autorización

### **Zaida (Admin)**:
1. Ver notificaciones de solicitudes pendientes
2. Ir a "Autorizar"
3. Revisar solicitud
4. Aprobar (descuenta stock automáticamente)
5. Se genera vale de retiro en PDF

### **Registro de Entradas**:
1. Ir a "Entradas"
2. Escanear código o ingresar manualmente
3. Ingresar cantidad
4. Registrar (suma al stock automáticamente)

## 📚 **Productos de Ejemplo Incluidos**
- MAT-001: Soldadura 7018 (barcode: 789123456789)
- EPP-001: Casco Soldador (barcode: 123456789012)
- MAT-002: Cable 12 AWG (barcode: 456789123456)
- EPP-002: Guantes Dieléctricos (barcode: 987654321098)

## 🎯 **Casos de Uso**

### **Escenario 1**: Solicitud Manual
1. Carlos (soldadura) busca "MAT-001"
2. Selecciona cantidad deseada
3. Envía solicitud
4. Zaida ve notificación
5. Aprueba y se genera vale PDF

### **Escenario 2**: Entrada de Stock
1. Llega nuevo stock de cascos
2. Zaida escanea EPP-001 
3. Ingresa cantidad recibida
4. Stock se actualiza automáticamente

### **Escenario 3**: Reporte de Stock Bajo
1. Zaida va a "Reportes"
2. Selecciona "Stock Bajo"
3. Se genera PDF con productos bajo mínimo
4. Puede planificar reposición

## 🔍 **Características de Búsqueda**
- Buscar por código de producto
- Buscar por nombre
- Buscar por código de barras
- Filtros por tipo (Material/EPP)
- Filtro de stock bajo
- Búsqueda en tiempo real

## 💡 **Tips de Uso**

### **Escaneo Rápido**:
- La pistola USB funciona automáticamente
- En celulares, usar botón "📷 Escanear"
- Los códigos se autocompletan inteligentemente

### **Solicitudes Rápidas**:
- Escanear códigos directamente en el buscador
- Usar cantidades por defecto (1)
- Duplicar solicitudes similares

### **Gestión de Stock**:
- Revisar alertas de stock bajo regularmente
- Registrar entradas inmediatamente al recibir
- Usar ubicaciones precisas para facilitar búsqueda

## 📞 **Soporte**

El sistema está diseñado para ser intuitivo y no requerir capacitación técnica. Todas las funciones tienen confirmaciones visuales y mensajes claros.

### **Problemas Comunes**:
- **No escanea**: Verificar que el foco no esté en un campo de texto
- **No guarda**: Verificar que el navegador permita localStorage
- **Lento**: Limpiar cache del navegador periódicamente

---

**Sistema desarrollado específicamente para L.A.N.G.**  
*Control de Bodega - Versión 1.0.0*
