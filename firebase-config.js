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

// Inicializa Firebase (usando el SDK "compat" que cargamos en index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();