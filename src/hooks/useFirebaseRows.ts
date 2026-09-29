import { useEffect, useState, useRef } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot, writeBatch, doc, query, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export function useFirebaseRows<T extends { id?: string }>(collectionName: string, initialRows: T[]) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [editing, setEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const startEditingCell = (cellId: string) => { setEditingCell(cellId); setEditing(true); };
  const [saved, setSaved] = useState(false);
  const isLoaded = useRef(false);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && !isLoaded.current) {
        // If empty on first load, we keep initialRows (mock data)
        isLoaded.current = true;
        return;
      }
      const fetchedRows = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
      setRows(fetchedRows);
      isLoaded.current = true;
    });
    return () => unsubscribe();
  }, [collectionName]);

  const updateRow = (index: number, patch: Partial<T>) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
    setSaved(false);
  };

  const addRow = (row: T) => {
    setRows((current) => [...current, row]);
    setSaved(false);
    setEditing(true);
  };

  const deleteRow = (index: number) => {
    setRows((current) => current.filter((_row, rowIndex) => rowIndex !== index));
    setSaved(false);
    setEditing(true);
  };

  const save = async () => {
    try {
      const batch = writeBatch(db);
      
      // Get all existing docs to handle deletes
      const existingDocs = await getDocs(collection(db, collectionName));
      const existingIds = new Set(existingDocs.docs.map(d => d.id));
      
      const currentIds = new Set<string>();

      for (const row of rows) {
        let docRef;
        if (row.id) {
          docRef = doc(db, collectionName, row.id);
          currentIds.add(row.id);
        } else {
          docRef = doc(collection(db, collectionName));
          row.id = docRef.id;
          currentIds.add(docRef.id);
        }
        
        // Firestore batch.set fails if there are undefined values
        const cleanRow = Object.fromEntries(Object.entries(row).filter(([_, v]) => v !== undefined));
        batch.set(docRef, cleanRow);
      }
      
      // Delete missing docs
      for (const id of existingIds) {
        if (!currentIds.has(id)) {
          batch.delete(doc(db, collectionName, id));
        }
      }

      await batch.commit();
      setSaved(true);
      setEditing(false);
      setEditingCell(null);
      toast.success("Changes saved to database.");
    } catch (e: any) {
      console.error("Error saving to Firebase", e);
      toast.error("Failed to save: " + e.message);
    }
  };

  const reset = () => {
    setSaved(true);
    setEditing(false);
    // Reloading happens automatically via onSnapshot if we trigger a state update
  };

  return {
    editingCell,
    startEditingCell, rows, editing, setEditing, updateRow, addRow, deleteRow, save, reset, saved };
}
