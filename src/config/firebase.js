import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzeyplk1B1D8dSNzxvFuujS7fTcJpZMPk",
  authDomain: "inventory-6a90a.firebaseapp.com",
  databaseURL: "https://inventory-6a90a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inventory-6a90a",
  storageBucket: "inventory-6a90a.firebasestorage.app",
  messagingSenderId: "300140390543",
  appId: "1:300140390543:web:ed41471fc2d96871cb28fa",
  measurementId: "G-QNLBB86EYH"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
