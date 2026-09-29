import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlTp6s8awlO4xk29JTKaxaiHNfQHwna88",
  authDomain: "klop-db.firebaseapp.com",
  projectId: "klop-db"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const batch = writeBatch(db);
const docRef = doc(db, 'test', 'test');
try {
  batch.set(docRef, { a: undefined });
  console.log('Success');
} catch(e) {
  console.log('Error:', e.message);
}
process.exit(0);
