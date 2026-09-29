import React from "react";
import { useExchangeRates } from "./ExchangeRatesContext";

export function ExchangeRateBanner() {
  const { eurToEgp, usdToEgp, loading } = useExchangeRates();

  if (loading) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg" title="European Union">🇪🇺</span>
          <span className="font-semibold text-blue-900 text-sm">1 EUR =</span>
          <span className="font-bold text-blue-700 text-sm">{eurToEgp.toFixed(2)} EGP</span>
          <span className="text-lg ml-1" title="Egypt">🇪🇬</span>
        </div>
        <div className="w-px h-4 bg-blue-200"></div>
        <div className="flex items-center gap-2">
          <span className="text-lg" title="United States">🇺🇸</span>
          <span className="font-semibold text-blue-900 text-sm">1 USD =</span>
          <span className="font-bold text-blue-700 text-sm">{usdToEgp.toFixed(2)} EGP</span>
          <span className="text-lg ml-1" title="Egypt">🇪🇬</span>
        </div>
      </div>
      <div className="text-xs text-blue-600/70 font-medium flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        Live API Rates
      </div>
    </div>
  );
}
