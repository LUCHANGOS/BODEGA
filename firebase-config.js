// Configuración de Firebase para Bodega L.A.N.G.
// IMPORTANTE: Estas son credenciales de desarrollo. Para producción usar variables de entorno.

const firebaseConfig = {
    apiKey: "AIzaSyCKF1pXZhtqFtLqoRqibxX0H8WpgZyZVWw",
    authDomain: "bodega-823de.firebaseapp.com",
    databaseURL: "https://bodega-823de-default-rtdb.firebaseio.com/",
    projectId: "bodega-823de",
    storageBucket: "bodega-823de.firebasestorage.app",
    messagingSenderId: "835835431751",
    appId: "1:835835431751:web:fcf63eeef8ee80ccb55a62",
    measurementId: "G-2WYGRZM3KX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos
const database = firebase.database();

// Referencias específicas a las colecciones
const DB_REFS = {
    products: database.ref('products'),
    requests: database.ref('requests'), 
    entries: database.ref('entries'),
    deliveries: database.ref('deliveries'),
    stockAdjustments: database.ref('stockAdjustments')
};

console.log('Firebase inicializado correctamente');
