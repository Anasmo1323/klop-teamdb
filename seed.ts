import { db } from "./src/firebase";
import { writeBatch, doc, collection } from "firebase/firestore";
import { targets, deals, purchaseOrders, invoices, team } from "./src/data/crm";

async function run() {
  try {
    console.log("Seeding data to Firebase...");
    const batch = writeBatch(db);
    targets.forEach(t => batch.set(doc(db, "medsales-targets", t.id), t));
    deals.forEach(t => batch.set(doc(db, "medsales-forecast", t.id), t));
    purchaseOrders.forEach(t => batch.set(doc(db, "medsales-purchase-orders", t.id), t));
    invoices.forEach(t => batch.set(doc(db, "medsales-invoices", t.id), t));
    team.forEach(t => batch.set(doc(db, "medsales-team", t.id), t));
    await batch.commit();
    console.log("Firebase seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding Firebase:", err);
    process.exit(1);
  }
}

run();
