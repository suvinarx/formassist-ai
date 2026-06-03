import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBodbDmVP_dr00xCO60-7eTyiD7GdyabuE",
  authDomain: "formassist-ai-73ec9.firebaseapp.com",
  projectId: "formassist-ai-73ec9",
  storageBucket: "formassist-ai-73ec9.firebasestorage.app",
  messagingSenderId: "551626164230",
  appId: "1:551626164230:web:5647459d3591c494c7db87",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
