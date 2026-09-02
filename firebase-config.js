// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// Estos son los datos reales de tu proyecto "muro-debate-tecno".
// No hace falta que toques nada de este archivo.
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyAt77wKnpIuKYRCXbOVkWIi4ht8y5SNzhQ",
    authDomain: "muro-debate-tecno.firebaseapp.com",
    projectId: "muro-debate-tecno",
    storageBucket: "muro-debate-tecno.firebasestorage.app",
    messagingSenderId: "259038354086",
    appId: "1:259038354086:web:23045f7a9ccaaa3baef267"
};

// Inicializa Firebase (usando el SDK "compat" que cargamos en index.html).
// Se declara "db" siempre y se envuelve en try/catch: si por wifi cortada
// el SDK de Firebase no llega a cargar, "db" queda simplemente sin definir
// en lugar de romper a mitad de camino y tirar abajo el resto de script.js
// (pestañas, menú, animaciones, acordeón, etc. seguirían funcionando igual).
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (error) {
    console.error("No se pudo inicializar Firebase:", error);
}