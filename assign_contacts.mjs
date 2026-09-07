import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

async function assignAllToAnas() {
  console.log("Authenticating...");
  await signInWithEmailAndPassword(auth, "amohamed@technowave-eg.com", "!@#klop05072026");
  
  console.log("Fetching contacts...");
  const contactsRef = collection(db, "contacts");
  const snapshot = await getDocs(contactsRef);
  
  let updatedCount = 0;
  for (const document of snapshot.docs) {
    try {
      const docRef = doc(db, "contacts", document.id);
      await updateDoc(docRef, { addedBy: "Anas Mohamed" });
      console.log(`Updated contact ID: ${document.id}`);
      updatedCount++;
    } catch (e) {
      console.error(`Error updating contact ${document.id}:`, e);
    }
  }
  
  console.log(`Update complete! Assigned ${updatedCount} contacts to Anas Mohamed.`);
  process.exit(0);
}

assignAllToAnas();
