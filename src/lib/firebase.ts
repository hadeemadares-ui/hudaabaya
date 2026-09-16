import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

// Firebase Project Credentials for Project ID: huda-abaya
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC_HudaAbayaRealtimeFirestoreKey2026",
  authDomain: "huda-abaya.firebaseapp.com",
  projectId: "huda-abaya",
  storageBucket: "huda-abaya.appspot.com",
  messagingSenderId: "108823456789",
  appId: "1:108823456789:web:hudaabayadubaiapp2026"
};

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
