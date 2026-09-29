import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlTp6s8awlO4xk29JTKaxaiHNfQHwna88",
  authDomain: "klop-db.firebaseapp.com",
  projectId: "klop-db",
  storageBucket: "klop-db.firebasestorage.app",
  messagingSenderId: "600668900851",
  appId: "1:600668900851:web:4a580191f15bbd074a5686"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const qs = await getDocs(collection(db, "medsales-purchase-orders"));
  console.log("medsales-purchase-orders size:", qs.size);
  qs.forEach(d => console.log(d.id, d.data()));

  const fs = await getDocs(collection(db, "medsales-forecast"));
  console.log("medsales-forecast size:", fs.size);
  const deal1 = fs.docs.find(d => d.id === "DEAL-001");
  if (deal1) console.log("DEAL-001 data:", deal1.data());
}

check().catch(console.error).then(() => process.exit(0));
