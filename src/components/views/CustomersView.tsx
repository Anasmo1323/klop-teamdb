import { useState, useMemo, useEffect } from "react";
import { getAvatarColor, getInitials, getPositionBadgeColor, cn } from "../../lib/utils";
import { Paperclip, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Flag } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { Customer } from "../../App";

interface CustomersViewProps {
  data: Customer[];
  searchQuery?: string;
  isAdmin?: boolean;
  onEdit?: (customer: Customer) => void;
}

const columnHelper = createColumnHelper<Customer>();

export function CustomersView({ data, searchQuery = "", isAdmin = false, onEdit }: CustomersViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    columnHelper.accessor("employeeName", {
      header: "Employee",
      cell: (info) => {
        const name = info.getValue();
        const initials = getInitials(name);
        const colorClass = getAvatarColor(name);
        const hospital = info.row.original.hospitalName;
        
        return (
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", colorClass)}>
              {initials}
            </div>
            <div className="flex flex-col min-w-[120px] w-full">
              <span className="text-sm font-medium text-gray-900">{name}</span>
              <span className="text-xs text-gray-500 truncate max-w-[160px]">{hospital}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("position", {
      header: "Position",
      cell: (info) => (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap", getPositionBadgeColor(info.getValue()))}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("mobileNumber", {
      header: "Mobile",
      cell: (info) => <span className="text-sm text-gray-600 tabular-nums">{info.getValue()}</span>,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => <span className="text-sm text-gray-600 truncate max-w-[160px] block">{info.getValue()}</span>,
    }),
    columnHelper.accessor("attachedFiles", {
      header: "Files",
      enableSorting: false,
      cell: (info) => {
        const files = info.getValue();
        if (!files || files.length === 0) return (
          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">0</span>
        );
        
        return (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors px-2.5 py-1 rounded-full cursor-pointer group relative">
              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{files.length}</span>
              
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-2 rounded-lg text-xs shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-nowrap flex flex-col gap-1">
                {files.map((f, i) => (
                  <span key={i} className="block truncate max-w-[200px] hover:text-primary" onClick={(e) => { e.stopPropagation(); window.open(f.url, '_blank'); }}>
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const customer = info.row.original;
        
        const toggleFlag = async (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!isAdmin) return;
          try {
            const docRef = doc(db, "customers", customer.id);
            await updateDoc(docRef, { flagged: !customer.flagged });
          } catch (err) {
            console.error("Failed to toggle flag:", err);
          }
        };

        return isAdmin ? (
          <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity gap-1">
            <button 
              onClick={toggleFlag}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
              title={customer.flagged ? "Remove Flag" : "Flag Customer"}
            >
              <Flag className={cn("w-4 h-4", customer.flagged ? "text-red-500 fill-red-500" : "text-gray-400")} />
            </button>
            <button 
              onClick={() => onEdit && onEdit(customer)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              title="Edit Customer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ) : null;
      },
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: searchQuery,
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      isAdmin,
    }
  });

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-100 bg-white">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th 
                        key={header.id} 
                        className={cn(
                          "h-11 px-4 align-middle text-[11px] font-semibold tracking-wider uppercase text-gray-400 first:pl-6 last:pr-6",
                          canSort && "cursor-pointer hover:text-gray-600 transition-colors select-none group/th"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          
                          {/* Sort Indicator */}
                          {canSort && (
                            <div className="w-3.5 h-3.5 flex items-center justify-center">
                              {{
                                asc: <ArrowUp className="w-3 h-3 text-primary" />,
                                desc: <ArrowDown className="w-3 h-3 text-primary" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-50 transition-opacity" />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group/row border-b border-gray-50 last:border-0 hover:bg-[#F9FAFB] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle first:pl-6 last:pr-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-gray-500 text-sm">
                    No customers found. Click "New Customer" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {table.getRowModel().rows.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-900">{data.length}</span> results
            </span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm disabled:opacity-50">Prev</button>
              <button className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
