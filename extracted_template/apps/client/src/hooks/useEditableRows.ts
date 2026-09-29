import { useEffect, useState } from "react";

export function useEditableRows<T>(storageKey: string, initialRows: T[]) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as T[];
      if (Array.isArray(parsed)) setRows(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

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
  };

  const save = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(rows));
    setSaved(true);
    setEditing(false);
  };

  const reset = () => {
    window.localStorage.removeItem(storageKey);
    setRows(initialRows);
    setSaved(true);
    setEditing(false);
  };

  return { rows, editing, setEditing, updateRow, addRow, deleteRow, save, reset, saved };
}
