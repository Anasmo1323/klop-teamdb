import React from "react";
import { useExchangeRates } from "./ExchangeRatesContext";
import { Search, User, TrendingUp } from "lucide-react";

export function GlobalTopBar() {
  const { eurToEgp, usdToEgp, loading } = useExchangeRates();

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
      <div className="flex items-center gap-2.5">
        {loading ? (
          <>
            <div className="skeleton h-7 w-32 rounded-full" />
            <div className="skeleton h-7 w-32 rounded-full" />
          </>
        ) : (
          <>
            <TickerChip
              flag="🇪🇺"
              label="EUR"
              value={`${eurToEgp.toFixed(2)} EGP`}
              color="blue"
            />
            <TickerChip
              flag="🇺🇸"
              label="USD"
              value={`${usdToEgp.toFixed(2)} EGP`}
              color="teal"
            />
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"
                style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
              />
              <span className="text-xs text-slate-400 font-medium">Live</span>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Search + Avatar */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (decorative for now, Cmd+K) */}
        <button
          className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 h-8 transition-colors group"
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
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
          style={{
            background: "var(--primary-light)",
            color: "var(--primary-text)",
            border: "1.5px solid rgba(37,99,235,0.2)",
          }}
          aria-label="User menu"
        >
          <User size={16} />
        </button>
      </div>
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
