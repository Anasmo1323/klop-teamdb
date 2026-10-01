import React, { useState, useRef, useEffect } from "react";
import { useExchangeRates } from "./ExchangeRatesContext";
import { Search, User, TrendingUp, LogOut, Settings, Check, X } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { GlobalSearchModal } from "../components/views/crm/GlobalSearchModal";

export function GlobalTopBar() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { eurToEgp, usdToEgp, loading, isCustom, updateCustomRates } = useExchangeRates();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isEditingRates, setIsEditingRates] = useState(false);
  const [editEur, setEditEur] = useState("");
  const [editUsd, setEditUsd] = useState("");
  const [isSavingRates, setIsSavingRates] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchClick = () => {
    setSearchModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Failed to sign out", e);
    }
  };

  const handleDoubleClickRates = () => {
    setEditEur(eurToEgp.toFixed(4));
    setEditUsd(usdToEgp.toFixed(4));
    setIsEditingRates(true);
  };

  const handleSaveRates = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleSaveRates called! Current values:", { editEur, editUsd });
    
    const eurStr = editEur.replace(',', '.');
    const usdStr = editUsd.replace(',', '.');
    
    const eur = parseFloat(eurStr);
    const usd = parseFloat(usdStr);
    
    console.log("Parsed values:", { eur, usd });
    
    if (!isNaN(eur) && !isNaN(usd) && eur > 0 && usd > 0) {
      console.log("Validation passed! Calling updateCustomRates...");
      setIsSavingRates(true);
      try {
        await updateCustomRates(usd, eur);
        console.log("updateCustomRates succeeded!");
        setIsEditingRates(false);
        toast.success("Exchange rates updated successfully");
      } catch (error: any) {
        console.error("Failed to save rates:", error);
        toast.error("Failed to save rates: " + (error.message || "Unknown error"));
      } finally {
        setIsSavingRates(false);
      }
    } else {
      console.log("Validation failed!");
      toast.error("Please enter valid numbers greater than 0");
    }
  };

  return (
    <div
      className="h-14 flex items-center justify-between px-6 shrink-0 no-print"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* LEFT: Exchange rate ticker chips */}
      <div 
        className="flex items-center gap-2.5 select-none transition-colors"
        onDoubleClick={!isEditingRates ? handleDoubleClickRates : undefined}
        title={!isEditingRates ? "Double-click to manually set exchange rates" : undefined}
      >
        {loading ? (
          <>
            <div className="skeleton h-7 w-32 rounded-full" />
            <div className="skeleton h-7 w-32 rounded-full" />
          </>
        ) : (
          <>
            {isEditingRates ? (
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 h-9 rounded-full border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇪🇺</span>
                  <span className="text-xs font-semibold text-blue-900">1 EUR =</span>
                  <Input 
                    type="text"
                    value={editEur} 
                    onChange={(e) => setEditEur(e.target.value)}
                    className="h-6 w-20 px-1.5 text-xs font-bold bg-white text-blue-900 border-blue-200"
                  />
                </div>
                <div className="w-px h-4 bg-blue-200 mx-1"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇺🇸</span>
                  <span className="text-xs font-semibold text-blue-900">1 USD =</span>
                  <Input 
                    type="text"
                    value={editUsd} 
                    onChange={(e) => setEditUsd(e.target.value)}
                    className="h-6 w-20 px-1.5 text-xs font-bold bg-white text-blue-900 border-blue-200"
                  />
                </div>
                <div className="flex items-center gap-1 ml-2 border-l border-blue-200 pl-2">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleSaveRates} disabled={isSavingRates}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => setIsEditingRates(false)} disabled={isSavingRates}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <TickerChip
                  flag="🇪🇺"
                  label="EUR"
                  value={`${eurToEgp.toFixed(4)} EGP`}
                  color="blue"
                />
                <TickerChip
                  flag="🇺🇸"
                  label="USD"
                  value={`${usdToEgp.toFixed(4)} EGP`}
                  color="teal"
                />
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 ml-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${isCustom ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                  />
                  <span className="text-xs text-slate-400 font-medium">
                    {isCustom ? 'Manual Override' : 'Live'}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Search + Avatar */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (decorative for now, Cmd+K) */}
        <button
          className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 h-8 transition-colors group"
          onClick={handleSearchClick}
          aria-label="Search CRM (Ctrl+K)"
        >
          <Search size={14} className="text-slate-400" />
          <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
            Search CRM...
          </span>
          <kbd className="ml-3 hidden md:inline-flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* User avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all hover:opacity-80"
            style={{
              background: "var(--primary-light)",
              color: "var(--primary-text)",
              border: "1.5px solid rgba(37,99,235,0.2)",
            }}
            aria-label="User menu"
          >
            {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : <User size={16} />}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500 truncate">Signed in as</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {auth.currentUser?.email || "Unknown user"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  const event = new CustomEvent('navigate-tab', { detail: 'settings' });
                  window.dispatchEvent(event);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      
      <GlobalSearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}

function TickerChip({
  flag,
  label,
  value,
  color,
}: {
  flag: string;
  label: string;
  value: string;
  color: "blue" | "teal";
}) {
  const styles =
    color === "blue"
      ? { bg: "#EFF6FF", border: "rgba(37,99,235,0.15)", labelColor: "#1E40AF", valueColor: "#1D4ED8" }
      : { bg: "#F0FDFA", border: "rgba(13,148,136,0.15)", labelColor: "#115E59", valueColor: "#0D9488" };

  return (
    <div
      className="flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <span>{flag}</span>
      <span style={{ color: styles.labelColor }}>1 {label} =</span>
      <span style={{ color: styles.valueColor, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}
