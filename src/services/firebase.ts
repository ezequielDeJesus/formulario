import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCc5IvJbNpntoTNzX-Knj7GZ-Smqx4Kxhg",
    authDomain: "form-atemes-app-unique-id-123.firebaseapp.com",
    projectId: "form-atemes-app-unique-id-123",
    storageBucket: "form-atemes-app-unique-id-123.firebasestorage.app",
    messagingSenderId: "948111168316",
    appId: "1:948111168316:web:ec329c5da586bd61644439"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
