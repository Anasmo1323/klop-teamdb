import { FileText, Download, ExternalLink } from "lucide-react";

interface Customer {
  employeeName: string;
  attachedFiles?: { name: string; url: string }[];
}

interface FilesViewProps {
  data: Customer[];
}

export function FilesView({ data }: FilesViewProps) {
  const allFiles = data.flatMap(customer => 
    (customer.attachedFiles || []).map(file => ({ 
      ...file, 
      customerName: customer.employeeName 
    }))
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">All Attachments</h2>
        <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
          {allFiles.length} files total
        </span>
      </div>
      
      {allFiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No files found</h3>
          <p className="text-sm text-gray-500">Files attached to customers will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allFiles.map((file, i) => {
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            let downloadUrl = file.url;
            if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
              const cleanName = encodeURIComponent(nameWithoutExt);
              downloadUrl = downloadUrl.replace('/upload/', `/upload/fl_attachment:${cleanName}/`);
            }
            
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex-1 flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Uploaded by: <span className="font-medium text-gray-700">{file.customerName}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                  <a 
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <button 
                    onClick={() => window.open(file.url, '_blank')}
                    className="flex items-center justify-center w-8 h-8 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors shrink-0"
                    title="Download (opens in new tab)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
