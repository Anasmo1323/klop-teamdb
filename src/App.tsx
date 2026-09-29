import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { ContactForm } from "./components/ContactForm";
import { SidebarNav } from "./components/layout/SidebarNav";
import { TopBar } from "./components/layout/TopBar";

import { ContactsView } from "./components/views/ContactsView";
import { FilesView } from "./components/views/FilesView";
import { SettingsView } from "./components/views/SettingsView";
import { ExchangeRatesProvider } from "./contexts/ExchangeRatesContext";
import { GlobalTopBar } from "./contexts/GlobalTopBar";
import { LoginView } from "./components/views/LoginView";
import { DashboardPage, TargetsPage, ForecastPage, PipelinesPage, PurchaseOrdersPage, InvoicesPage, SalesTeamPage, SetupPage } from "./components/views/crm/Pages";
import { CrmShell } from "./components/views/crm/CrmShell";

export const ALLOWED_USERS = [
  "albear@technowave-eg.com",
  "amohamed@technowave-eg.com",
  "asalah@technowave-eg.com"
];

export const HARDCODED_ADMINS = [
  "albear@technowave-eg.com"
];

export type Contact = {
  id: string;
  hospitalName: string;
  employeeName: string;
  position: string;
  mobileNumber: string;
  email: string;
  addedBy?: string;
  attachedFiles?: { name: string; url: string }[];
  flagged?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function App() {
  const [data, setData] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState("contacts");
  const [contactTab, setContactTab] = useState<"all" | "recent" | "flagged">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
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

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveTab(customEvent.detail);
    };
    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, []);

  const handleExportCSV = () => {
    const headers = ["HOSPITAL NAME", "EMPLOYEE NAME", "POSITION", "MOBILE NUMBER", "EMAIL", "ADDED BY"];
    const rows = data.map(d => [
      `"${d.hospitalName}"`,
      `"${d.employeeName}"`,
      `"${d.position}"`,
      `"=""${d.mobileNumber}"""`,
      `"${d.email}"`,
      `"${d.addedBy || ""}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contacts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setCurrentUserEmail(user.email.toLowerCase());
      } else {
        setCurrentUserEmail(null);
      }
      setAuthLoading(false);
    });

    const q = query(collection(db, "contacts"));
    const unsubscribeContacts = onSnapshot(q, (querySnapshot) => {
      const contactsList: Contact[] = [];
      querySnapshot.forEach((doc) => {
        contactsList.push({ id: doc.id, ...doc.data() } as Contact);
      });
      setData(contactsList);
    });

    const adminsQuery = query(collection(db, "admins"));
    const unsubscribeAdmins = onSnapshot(adminsQuery, (snapshot) => {
      const adminEmails = snapshot.docs.map(doc => doc.data().email);
      setExtraAdmins(adminEmails);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeContacts();
      unsubscribeAdmins();
    };
  }, []);

  const filteredData = useMemo(() => {
    let result = data;

    // 1. Apply Contact Tab (All, Recent, Flagged)
    if (contactTab === "flagged") {
      result = result.filter(c => c.flagged === true);
    } else if (contactTab === "recent") {
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
  }, [data, searchQuery, filters, contactTab]);

  const flaggedCount = data.filter(c => c.flagged === true).length;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "targets":
        return <TargetsPage />;
      case "pipelines":
        return <ForecastPage />;
      case "pipelines_analysis":
        return <PipelinesPage />;
      case "orders":
        return <PurchaseOrdersPage />;
      case "invoices":
        return <InvoicesPage />;
      case "team":
        return <SalesTeamPage />;
      case "setup":
        return <SetupPage />;
      case "contacts":
        return <ContactsView 
          data={filteredData} 
          searchQuery={searchQuery} 
          isAdmin={isAdmin} 
          onEdit={(c) => setEditingContact(c)} 
        />;
      case "files":
        return <FilesView data={filteredData} />;
      case "settings":
        return <SettingsView isAdmin={isAdmin} currentUserEmail={currentUserEmail} onLogout={handleLogout} extraAdmins={extraAdmins} />;
      default:
        return <ContactsView 
          data={filteredData} 
          searchQuery={searchQuery} 
          isAdmin={isAdmin} 
          onEdit={(c) => setEditingContact(c)} 
        />;
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
    <ExchangeRatesProvider>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--background)" }}>
        <SidebarNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onAddClick={() => setShowAddForm(true)} 
          onExportCSV={handleExportCSV}
        />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <GlobalTopBar />
          {activeTab === "contacts" && (
          <TopBar 
          onAddClick={() => setShowAddForm(true)} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportCSV={handleExportCSV}
          filters={filters}
          onFiltersChange={setFilters}
          contactTab={contactTab}
          onContactTabChange={setContactTab}
          flaggedCount={flaggedCount}
        />
        )}
        
        <div className="flex-1 overflow-auto" style={{ background: "var(--background)" }}>
          <CrmShell role={isAdmin ? "admin" : "sales"} adminEmail={currentUserEmail || ""}>
            {renderContent()}
          </CrmShell>
        </div>

        {/* Slide-over Form for Add or Edit */}
        {(showAddForm || editingContact) && (
          <div className="absolute inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]" onClick={() => { setShowAddForm(false); setEditingContact(null); }} />
            <div className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
              <ContactForm 
                initialData={editingContact}
                onSuccess={() => { setShowAddForm(false); setEditingContact(null); }} 
                onCancel={() => { setShowAddForm(false); setEditingContact(null); }} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
    </ExchangeRatesProvider>
  );
}

export default App;
