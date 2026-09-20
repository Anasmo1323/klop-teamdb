import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBlTp6s8awlO4xk29JTKaxaiHNfQHwna88",
  authDomain: "klop-db.firebaseapp.com",
  projectId: "klop-db",
  storageBucket: "klop-db.firebasestorage.app",
  messagingSenderId: "600668900851",
  appId: "1:600668900851:web:4a580191f15bbd074a5686",
  measurementId: "G-Z23KZG95MD"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
