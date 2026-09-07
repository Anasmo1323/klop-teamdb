import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
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

const rawData = fs.readFileSync('excel_contacts.json', 'utf-8');
const dummyData = JSON.parse(rawData);

async function seed() {
  console.log("Authenticating...");
  await signInWithEmailAndPassword(auth, "amohamed@technowave-eg.com", "!@#klop05072026");
  console.log("Seeding database with actual contacts...");
  const contactsRef = collection(db, "contacts");
  
  let addedCount = 0;
  for (const contact of dummyData) {
    if (!contact.employeeName && !contact.mobileNumber) continue;
    try {
      const q = query(
        contactsRef,
        where("employeeName", "==", contact.employeeName),
        where("mobileNumber", "==", contact.mobileNumber)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Skipping duplicate: ${contact.employeeName}`);
        continue;
      }
      
      const docRef = await addDoc(contactsRef, {
        ...contact,
        createdAt: new Date().toISOString(),
        flagged: false,
        attachedFiles: []
      });
      console.log(`Added contact: ${contact.employeeName} (ID: ${docRef.id})`);
      addedCount++;
    } catch (e) {
      console.error(`Error adding ${contact.employeeName}:`, e);
    }
  }
  console.log(`Seeding complete! Added ${addedCount} contacts. You can exit the script now.`);
  process.exit(0);
}

seed();
