import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ExchangeRates {
  eurToEgp: number;
  usdToEgp: number;
  loading: boolean;
  isCustom: boolean;
  updateCustomRates: (usd: number, eur: number) => Promise<void>;
}

const ExchangeRatesContext = createContext<ExchangeRates>({ 
  eurToEgp: 54, 
  usdToEgp: 49, 
  loading: true,
  isCustom: false,
  updateCustomRates: async () => {}
});

function getNext9AMCairoMs() {
  const now = new Date();
  const cairoString = now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }); 
  const cairoNow = new Date(cairoString);
  const offsetMs = cairoNow.getTime() - now.getTime();
  
  const target = new Date(cairoNow);
  if (target.getHours() >= 9) {
    target.setDate(target.getDate() + 1);
  }
  target.setHours(9, 0, 0, 0);
  
  return target.getTime() - offsetMs;
}

export function ExchangeRatesProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<{ eurToEgp: number; usdToEgp: number }>({ eurToEgp: 54, usdToEgp: 49 });
  const [loading, setLoading] = useState(true);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    // Listen to Firebase for manual overrides
    const docRef = doc(db, "settings", "exchange_rates");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.expiresAt && data.expiresAt > Date.now()) {
          // Use manual override
          setRates({ eurToEgp: data.eurToEgp, usdToEgp: data.usdToEgp });
          setIsCustom(true);
          setLoading(false);
          return;
        }
      }
      
      // If no override or it expired, fetch from API
      setIsCustom(false);
      fetch("https://open.er-api.com/v6/latest/USD")
        .then(res => res.json())
        .then(data => {
          if (data && data.rates) {
            const usdToEgp = data.rates.EGP;
            const usdToEur = data.rates.EUR;
            const eurToEgp = usdToEgp / usdToEur;
            setRates({ eurToEgp, usdToEgp });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });

    return () => unsubscribe();
  }, []);

  const updateCustomRates = async (usd: number, eur: number) => {
    const docRef = doc(db, "settings", "exchange_rates");
    await setDoc(docRef, {
      usdToEgp: usd,
      eurToEgp: eur,
      expiresAt: getNext9AMCairoMs()
    });
  };

  return (
    <ExchangeRatesContext.Provider value={{ ...rates, loading, isCustom, updateCustomRates }}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

export function useExchangeRates() {
  return useContext(ExchangeRatesContext);
}
