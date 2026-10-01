import React, { useState, useEffect, useRef } from "react";
import { Search, X, Briefcase, FileText, Target, Users, Receipt } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Input } from "../../ui/input";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  tab: string;
  icon: React.ReactNode;
};

export function GlobalSearchModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Cache data to avoid multiple fetches during a single modal session
  const [dataCache, setDataCache] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadAllData();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const loadAllData = async () => {
    if (dataCache) return;
    setLoading(true);
    try {
      const [contacts, forecast, targets, pos, invoices] = await Promise.all([
        getDocs(collection(db, "medsales-contacts")).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(collection(db, "medsales-forecast")).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(collection(db, "medsales-targets")).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(collection(db, "medsales-purchase-orders")).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(collection(db, "medsales-invoices")).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      ]);
      setDataCache({ contacts, forecast, targets, pos, invoices });
    } catch (e) {
      console.error("Error loading search data", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!query.trim() || !dataCache) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const hits: SearchResult[] = [];

    // Search contacts
    dataCache.contacts.forEach((c: any) => {
      if (`${c.name} ${c.hospital} ${c.position} ${c.phone} ${c.id}`.toLowerCase().includes(q)) {
        hits.push({
          id: c.id, type: "Contact", title: c.name || "Unknown", subtitle: c.hospital || "", tab: "contacts",
          icon: <Users size={14} className="text-blue-500" />
        });
      }
    });

    // Search forecast (pipeline)
    dataCache.forecast.forEach((f: any) => {
      if (`${f.client} ${f.productLine} ${f.product} ${f.deal} ${f.code} ${f.id}`.toLowerCase().includes(q)) {
        hits.push({
          id: f.id, type: "Pipeline", title: f.client || "Unknown", subtitle: f.product || "", tab: "pipelines",
          icon: <Briefcase size={14} className="text-indigo-500" />
        });
      }
    });

    // Search targets
    dataCache.targets.forEach((t: any) => {
      if (`${t.rep} ${t.region} ${t.focus} ${t.productLine} ${t.id}`.toLowerCase().includes(q)) {
        hits.push({
          id: t.id, type: "Target", title: t.rep || "Unknown", subtitle: t.focus || "", tab: "targets",
          icon: <Target size={14} className="text-red-500" />
        });
      }
    });

    // Search POs
    dataCache.pos.forEach((p: any) => {
      if (`${p.client} ${p.code} ${p.id}`.toLowerCase().includes(q)) {
        hits.push({
          id: p.id, type: "PO", title: p.client || "Unknown", subtitle: `PO: ${p.code || p.id}`, tab: "orders",
          icon: <FileText size={14} className="text-amber-500" />
        });
      }
    });

    // Search Invoices
    dataCache.invoices.forEach((i: any) => {
      if (`${i.client} ${i.code} ${i.po} ${i.id}`.toLowerCase().includes(q)) {
        hits.push({
          id: i.id, type: "Invoice", title: i.client || "Unknown", subtitle: `INV: ${i.code || i.id}`, tab: "invoices",
          icon: <Receipt size={14} className="text-green-500" />
        });
      }
    });

    setResults(hits.slice(0, 15)); // Limit to top 15
  }, [query, dataCache]);

  if (!open) return null;

  const navigateTo = (tab: string, id: string) => {
    sessionStorage.setItem("highlightRow", id);
    window.dispatchEvent(new CustomEvent("navigate-tab", { detail: tab }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("highlight-row", { detail: id }));
    }, 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[10vh] px-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 relative">
          <Search className="text-slate-400 mr-3" size={18} />
          <Input 
            ref={inputRef}
            className="flex-1 border-0 bg-transparent h-10 text-base shadow-none focus-visible:ring-0 px-0"
            placeholder="Search CRM for clients, products, names, invoice codes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <div className="absolute right-12 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
          <button onClick={onClose} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 ml-2">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && results.length === 0 && !loading && (
            <div className="px-6 py-12 text-center text-slate-500">
              No results found for "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Search Results</div>
              <ul className="space-y-1">
                {results.map((r, i) => (
                  <li key={`${r.type}-${r.id}-${i}`}>
                    <button 
                      onClick={() => navigateTo(r.tab, r.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {r.icon}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{r.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium">{r.type}</span>
                            {r.subtitle && (
                              <>
                                <span>&bull;</span>
                                <span>{r.subtitle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Jump to
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {!query.trim() && !loading && (
            <div className="px-6 py-10 text-center flex flex-col items-center justify-center">
              <Search className="text-slate-300 dark:text-slate-700 w-12 h-12 mb-3" />
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Search the entire CRM</h3>
              <p className="text-xs text-slate-400 max-w-[250px]">Find contacts, deals, orders, and invoices in one place.</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 px-4 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-sm">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
