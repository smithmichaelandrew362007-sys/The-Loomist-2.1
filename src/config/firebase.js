import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAuSW_39AjAG0Ckk-Scd2Gz4ydL5KkmH0A",
  authDomain: "the-loomist.firebaseapp.com",
  projectId: "the-loomist",
  storageBucket: "the-loomist.firebasestorage.app",
  messagingSenderId: "86165742020",
  appId: "1:86165742020:web:fea28c05f70a7c08920491",
  measurementId: "G-928X5S2797"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
