import React, { useState } from "react";
import { useExchangeRates } from "./ExchangeRatesContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Check, X } from "lucide-react";

export function ExchangeRateBanner() {
  const { eurToEgp, usdToEgp, loading, isCustom, updateCustomRates } = useExchangeRates();
  const [isEditing, setIsEditing] = useState(false);
  const [editEur, setEditEur] = useState("");
  const [editUsd, setEditUsd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (loading) return null;

  const handleDoubleClick = () => {
    setEditEur(eurToEgp.toFixed(4));
    setEditUsd(usdToEgp.toFixed(4));
    setIsEditing(true);
  };

  const handleSave = async () => {
    const eur = parseFloat(editEur);
    const usd = parseFloat(editUsd);
    
    if (!isNaN(eur) && !isNaN(usd) && eur > 0 && usd > 0) {
      setIsSaving(true);
      await updateCustomRates(usd, eur);
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between shadow-sm shrink-0 select-none transition-colors"
      onDoubleClick={!isEditing ? handleDoubleClick : undefined}
      title={!isEditing ? "Double-click to manually set exchange rates" : undefined}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg" title="European Union">🇪🇺</span>
          <span className="font-semibold text-blue-900 text-sm">1 EUR =</span>
          {isEditing ? (
            <Input 
              type="number"
              value={editEur} 
              onChange={(e) => setEditEur(e.target.value)}
              className="h-6 w-24 px-2 text-sm font-bold bg-white text-blue-900 border-blue-200"
              step="0.0001"
            />
          ) : (
            <span className="font-bold text-blue-700 text-sm cursor-pointer hover:text-blue-500 transition-colors">
              {eurToEgp.toFixed(4)} EGP
            </span>
          )}
          <span className="text-lg ml-1" title="Egypt">🇪🇬</span>
        </div>
        
        <div className="w-px h-4 bg-blue-200"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg" title="United States">🇺🇸</span>
          <span className="font-semibold text-blue-900 text-sm">1 USD =</span>
          {isEditing ? (
            <Input 
              type="number"
              value={editUsd} 
              onChange={(e) => setEditUsd(e.target.value)}
              className="h-6 w-24 px-2 text-sm font-bold bg-white text-blue-900 border-blue-200"
              step="0.0001"
            />
          ) : (
            <span className="font-bold text-blue-700 text-sm cursor-pointer hover:text-blue-500 transition-colors">
              {usdToEgp.toFixed(4)} EGP
            </span>
          )}
          <span className="text-lg ml-1" title="Egypt">🇪🇬</span>
        </div>

        {isEditing && (
          <div className="flex items-center gap-1 ml-2">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleSave} disabled={isSaving}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-blue-600/70 font-medium flex items-center gap-1.5">
        {!isEditing && (
          <>
            <div className={`w-1.5 h-1.5 rounded-full ${isCustom ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></div>
            {isCustom ? 'Manual Override (Active until 9 AM)' : 'Live API Rates'}
          </>
        )}
      </div>
    </div>
  );
}
