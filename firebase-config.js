// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyAt77wKnpIuKYRCXbOVkWIi4ht8y5SNzhQ",
    authDomain: "muro-debate-tecno.firebaseapp.com",
    projectId: "muro-debate-tecno",
    storageBucket: "muro-debate-tecno.firebasestorage.app",
    messagingSenderId: "259038354086",
    appId: "1:259038354086:web:23045f7a9ccaaa3baef267"
};

// Se inicializa Firebase (usando el SDK "compat" que cargue en index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
