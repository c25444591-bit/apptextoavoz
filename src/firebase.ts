// Firebase Configuration for LibroVoz
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA-xPKN2r9Yq-Cde6_dNsQaxtmo7Boxz5E",
    authDomain: "textoavideo-3ec1d.firebaseapp.com",
    projectId: "textoavideo-3ec1d",
    storageBucket: "textoavideo-3ec1d.firebasestorage.app",
    messagingSenderId: "773863406880",
    appId: "1:773863406880:web:c3b870c9397a94644e6b45",
    measurementId: "G-6V6X7CBVPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Firestore
export const db = getFirestore(app);

export default app;
