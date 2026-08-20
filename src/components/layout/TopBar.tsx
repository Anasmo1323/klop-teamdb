import { useState, useRef, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Download, X } from "lucide-react";
import { Button } from "../ui/button";

import { cn } from "../../lib/utils";

interface TopBarProps {
  onAddClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportCSV: () => void;
  filters: { hospitalName: string; position: string; hasFiles: boolean | null };
  onFiltersChange: (f: any) => void;
  customerTab: "all" | "recent" | "flagged";
  onCustomerTabChange: (tab: "all" | "recent" | "flagged") => void;
  flaggedCount: number;
}

export function TopBar({ onAddClick, searchQuery, onSearchChange, onExportCSV, filters, onFiltersChange, customerTab, onCustomerTabChange, flaggedCount }: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className="w-full pt-8 pb-6 px-8 flex flex-col gap-6 relative">
      {/* Row 1: Header & Actions */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-end gap-3">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900 leading-none">Customer Database</h1>
          <span className="text-sm font-medium text-gray-500 mb-[2px] bg-gray-200/60 px-2 py-0.5 rounded-md">
            v2.1
          </span>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Search Toggle / Input */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-10 w-64 animate-in slide-in-from-right-4 duration-200">
                <div className="pl-3 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search customers..."
                  className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-gray-900"
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm relative"
            >
              <Filter className="w-4 h-4" />
              {(filters.hospitalName || filters.position || filters.hasFiles !== null) && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Advanced Filters
                    </span>
                    <button 
                      onClick={() => onFiltersChange({ hospitalName: "", position: "", hasFiles: null })}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
                      <input 
                        type="text" 
                        value={filters.hospitalName}
                        onChange={(e) => onFiltersChange({ ...filters, hospitalName: e.target.value })}
                        placeholder="e.g. Cleopatra"
                        className="w-full h-8 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                      <input 
                        type="text" 
                        value={filters.position}
                        onChange={(e) => onFiltersChange({ ...filters, position: e.target.value })}
                        placeholder="e.g. Doctor"
                        className="w-full h-8 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Has Attachments</label>
                      <select 
                        value={filters.hasFiles === null ? "all" : filters.hasFiles ? "yes" : "no"}
                        onChange={(e) => {
                          const val = e.target.value;
                          onFiltersChange({ ...filters, hasFiles: val === "all" ? null : val === "yes" });
                        }}
                        className="w-full h-8 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                      >
                        <option value="all">Show All</option>
                        <option value="yes">Yes, has files</option>
                        <option value="no">No, empty</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              onBlur={() => setTimeout(() => setIsMoreOpen(false), 150)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {isMoreOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button 
                  onClick={() => {
                    onExportCSV();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                  Export CSV
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />
          
          <Button 
            onClick={onAddClick}
            className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm px-5 h-10"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Row 2: Tabs */}
      <div className="flex items-center p-1 bg-gray-200/50 rounded-xl w-fit">
        <button 
          onClick={() => onCustomerTabChange("all")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
            customerTab === "all" ? "text-gray-900 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          All Customers
        </button>
        <button 
          onClick={() => onCustomerTabChange("recent")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
            customerTab === "recent" ? "text-gray-900 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Recent
        </button>
        <button 
          onClick={() => onCustomerTabChange("flagged")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
            customerTab === "flagged" ? "text-gray-900 bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Flagged
          {flaggedCount > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {flaggedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
