import { Toaster as Sonner } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/auth/Index";
import NotFound from "./pages/not-found/Index";
import { RequireAuth } from "./components/auth/route-guards";
import {
  DashboardPage,
  InvoicesPage,
  PipelinesPage,
  PurchaseOrdersPage,
  SalesTeamPage,
  SetupPage,
  TargetsPage,
  ForecastPage,
} from "./pages/crm/pages";

const queryClient = new QueryClient();

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/targets" element={<Protected><TargetsPage /></Protected>} />
          <Route path="/forecast" element={<Protected><ForecastPage /></Protected>} />
          <Route path="/purchase-orders" element={<Protected><PurchaseOrdersPage /></Protected>} />
          <Route path="/pipelines" element={<Protected><PipelinesPage /></Protected>} />
          <Route path="/invoices" element={<Protected><InvoicesPage /></Protected>} />
          <Route path="/sales-team" element={<Protected><SalesTeamPage /></Protected>} />
          <Route path="/setup" element={<Protected><SetupPage /></Protected>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
