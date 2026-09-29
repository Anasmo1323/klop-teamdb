import React, { createContext, useContext, useEffect, useState } from "react";

interface ExchangeRates {
  eurToEgp: number;
  usdToEgp: number;
  loading: boolean;
}

const ExchangeRatesContext = createContext<ExchangeRates>({ eurToEgp: 54, usdToEgp: 49, loading: true });

export function ExchangeRatesProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<{ eurToEgp: number; usdToEgp: number }>({ eurToEgp: 54, usdToEgp: 49 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <ExchangeRatesContext.Provider value={{ ...rates, loading }}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

export function useExchangeRates() {
  return useContext(ExchangeRatesContext);
}
