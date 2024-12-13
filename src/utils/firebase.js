/**
 * Firebase configuration and initialization
 * 
 * @todo Add your Firebase configuration in the firebaseConfig object
 */
import firebaseConfig from './config/firebaseConfig';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const emailLogin = signInWithEmailAndPassword;
export const logout = signOut;
export const authStateChanged = onAuthStateChanged;