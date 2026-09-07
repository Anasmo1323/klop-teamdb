import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyBlTp6s8awlO4xk29JTKaxaiHNfQHwna88",
  authDomain: "klop-db.firebaseapp.com",
  projectId: "klop-db",
  storageBucket: "klop-db.firebasestorage.app",
  messagingSenderId: "600668900851",
  appId: "1:600668900851:web:4a580191f15bbd074a5686",
  measurementId: "G-Z23KZG95MD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const rawData = fs.readFileSync('excel_hospitals.json', 'utf-8');
const hospitals = JSON.parse(rawData);

async function seed() {
  console.log("Authenticating...");
  await signInWithEmailAndPassword(auth, "amohamed@technowave-eg.com", "!@#klop05072026");
  
  console.log("Seeding hospitals collection...");
  const hospitalsRef = collection(db, "hospitals");
  
  let addedCount = 0;
  for (const hospital of hospitals) {
    if (!hospital.nameEN) continue;
    try {
      const q = query(
        hospitalsRef,
        where("nameEN", "==", hospital.nameEN)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Skipping duplicate hospital: ${hospital.nameEN}`);
        continue;
      }
      
      const docRef = await addDoc(hospitalsRef, {
        ...hospital,
        createdAt: new Date().toISOString(),
      });
      console.log(`Added hospital: ${hospital.nameEN} (ID: ${docRef.id})`);
      addedCount++;
    } catch (e) {
      console.error(`Error adding hospital ${hospital.nameEN}:`, e);
    }
  }
  console.log(`Seeding complete! Added ${addedCount} hospitals. You can exit the script now.`);
  process.exit(0);
}

seed();
