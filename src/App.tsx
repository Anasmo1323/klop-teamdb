import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { CustomerForm } from "./components/CustomerForm";
import { SidebarNav } from "./components/layout/SidebarNav";
import { TopBar } from "./components/layout/TopBar";
import { DashboardView } from "./components/views/DashboardView";
import { CustomersView } from "./components/views/CustomersView";
import { FilesView } from "./components/views/FilesView";
import { SettingsView } from "./components/views/SettingsView";
import { LoginView } from "./components/views/LoginView";

export const HARDCODED_ADMINS = [
  "albear@technowave-eg.com",
  "amohamed@technowave-eg.com",
  "asalah@technowave-eg.com"
];

export type Customer = {
  id: string;
  hospitalName: string;
  employeeName: string;
  position: string;
  mobileNumber: string;
  email: string;
  attachedFiles?: { name: string; url: string }[];
  flagged?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function App() {
  const [data, setData] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customerTab, setCustomerTab] = useState<"all" | "recent" | "flagged">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    hospitalName: "",
    position: "",
    hasFiles: null as boolean | null
  });
  
  // Auth State
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [extraAdmins, setExtraAdmins] = useState<string[]>([]);

  const isAdmin = currentUserEmail ? (HARDCODED_ADMINS.includes(currentUserEmail) || extraAdmins.includes(currentUserEmail)) : false;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Failed to sign out", e);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee Name", "Hospital", "Position", "Mobile", "Email", "Files Count"];
    const rows = data.map(d => [
      `"${d.employeeName}"`,
      `"${d.hospitalName}"`,
      `"${d.position}"`,
      `"${d.mobileNumber}"`,
      `"${d.email}"`,
      d.attachedFiles?.length || 0
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      setAuthLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentUserEmail(user.email.toLowerCase());
      } else {
        setCurrentUserEmail(null);
      }
      setAuthLoading(false);
    });

    const q = query(collection(db, "customers"));
    const unsubscribeCustomers = onSnapshot(q, (querySnapshot) => {
      const customersList: Customer[] = [];
      querySnapshot.forEach((doc) => {
        customersList.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setData(customersList);
    });

    const adminsQuery = query(collection(db, "admins"));
    const unsubscribeAdmins = onSnapshot(adminsQuery, (snapshot) => {
      const adminEmails = snapshot.docs.map(doc => doc.data().email);
      setExtraAdmins(adminEmails);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCustomers();
      unsubscribeAdmins();
    };
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // 1. Apply Customer Tab (All, Recent, Flagged)
    if (customerTab === "flagged") {
      result = result.filter(c => c.flagged === true);
    } else if (customerTab === "recent") {
      // Recent means created in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter(c => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) >= sevenDaysAgo;
      });
    }

    // 2. Apply Global Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.employeeName.toLowerCase().includes(q) ||
        c.hospitalName.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    // 3. Apply Advanced Filters
    if (filters.hospitalName) {
      result = result.filter(c => c.hospitalName.toLowerCase().includes(filters.hospitalName.toLowerCase()));
    }
    if (filters.position) {
      result = result.filter(c => c.position.toLowerCase().includes(filters.position.toLowerCase()));
    }
    if (filters.hasFiles !== null) {
      if (filters.hasFiles) {
        result = result.filter(c => c.attachedFiles && c.attachedFiles.length > 0);
      } else {
        result = result.filter(c => !c.attachedFiles || c.attachedFiles.length === 0);
      }
    }

    return result;
  }, [data, searchQuery, filters, customerTab]);

  const flaggedCount = data.filter(c => c.flagged === true).length;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView data={filteredData} />;
      case "customers":
        return <CustomersView 
          data={filteredData} 
          searchQuery={searchQuery} 
          isAdmin={isAdmin} 
          onEdit={(c) => setEditingCustomer(c)} 
        />;
      case "files":
        return <FilesView data={filteredData} />;
      case "settings":
        return <SettingsView isAdmin={isAdmin} currentUserEmail={currentUserEmail} onLogout={handleLogout} extraAdmins={extraAdmins} />;
      default:
        return <DashboardView data={data} />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUserEmail) {
    return <LoginView extraAdmins={extraAdmins} />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
      <SidebarNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onAddClick={() => setShowAddForm(true)} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar 
          onAddClick={() => setShowAddForm(true)} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportCSV={handleExportCSV}
          filters={filters}
          onFiltersChange={setFilters}
          customerTab={customerTab}
          onCustomerTabChange={setCustomerTab}
          flaggedCount={flaggedCount}
        />
        
        <div className="flex-1 overflow-auto px-8 pb-8">
          {renderContent()}
        </div>

        {/* Slide-over Form for Add or Edit */}
        {(showAddForm || editingCustomer) && (
          <div className="absolute inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]" onClick={() => { setShowAddForm(false); setEditingCustomer(null); }} />
            <div className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
              <CustomerForm 
                initialData={editingCustomer}
                onSuccess={() => { setShowAddForm(false); setEditingCustomer(null); }} 
                onCancel={() => { setShowAddForm(false); setEditingCustomer(null); }} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
