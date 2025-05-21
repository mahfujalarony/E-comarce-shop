
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVgQnQkNbN_uaAy1LdMnKPHD2Z1wjQjlo",
  authDomain: "auth-3b4b0.firebaseapp.com",
  projectId: "auth-3b4b0",
  storageBucket: "auth-3b4b0.firebasestorage.app",
  messagingSenderId: "370859770753",
  appId: "1:370859770753:web:a5d135a3de95d8e4d5de80",
  measurementId: "G-DWFWDRYEBK"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();