import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCexCoHInrfs_jYh1itStv-r1O4PHhVLPY",
    authDomain: "the-taste-of-indore-9c92a.firebaseapp.com",
    projectId: "the-taste-of-indore-9c92a",
    storageBucket: "the-taste-of-indore-9c92a.firebasestorage.app",
    messagingSenderId: "550084866994",
    appId: "1:550084866994:web:cb625aa9dadab60da22aab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
