import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, getDocs, query, updateDoc, doc, where, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import hospitalsData from "../data/hospitals.json";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UploadCloud, AlertTriangle, Hospital, User, Phone, Mail, FileText } from "lucide-react";

const formSchema = z.object({
  hospitalName: z.string().min(1, "Hospital is required"),
  employeeName: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerForm({ onSuccess, onCancel, initialData }: { onSuccess: () => void, onCancel?: () => void, initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState<{ existingId: string; newData: FormValues } | null>(null);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSearch(initialData.hospitalName || "");
    } else {
      reset({});
      setSearch("");
    }
  }, [initialData, reset]);

  const selectedHospital = watch("hospitalName");

  const filteredHospitals = hospitalsData.filter(h => 
    h.nameEN.toLowerCase().includes(search.toLowerCase()) || 
    (h.nameAR && h.nameAR.includes(search))
  );

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Edit Mode
        const docRef = doc(db, "customers", initialData.id);
        await updateDoc(docRef, data);
        
        if (files && files.length > 0) {
          let attachedFiles: { name: string, url: string }[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
            
            const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
              method: "POST",
              body: formData
            });
            
            if (!res.ok) throw new Error("Cloudinary upload failed");
            const uploadData = await res.json();
            attachedFiles.push({ name: file.name, url: uploadData.secure_url });
          }
          await updateDoc(docRef, { 
            attachedFiles: arrayUnion(...attachedFiles) 
          });
        }
        reset();
        setFiles(null);
        onSuccess();
        return;
      }

      // Add Mode
      const q = query(
        collection(db, "customers"),
        where("employeeName", "==", data.employeeName),
        where("mobileNumber", "==", data.mobileNumber),
        where("email", "==", data.email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingId = querySnapshot.docs[0].id;
        setDuplicateConflict({ existingId, newData: data });
        setIsSubmitting(false);
        return;
      }

      const docRef = await addDoc(collection(db, "customers"), { 
        ...data, 
        createdAt: new Date().toISOString(),
        flagged: false
      });
      
      let attachedFiles: { name: string, url: string }[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: "POST",
            body: formData
          });
          
          if (!res.ok) throw new Error("Cloudinary upload failed");
          const uploadData = await res.json();
          
          attachedFiles.push({ name: file.name, url: uploadData.secure_url });
        }
        await updateDoc(docRef, { attachedFiles });
      }

      reset();
      setFiles(null);
      onSuccess();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplace = async () => {
    if (!duplicateConflict) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "customers", duplicateConflict.existingId);
      await updateDoc(docRef, duplicateConflict.newData);
      
      let attachedFiles: { name: string, url: string }[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: "POST",
            body: formData
          });
          
          if (!res.ok) throw new Error("Cloudinary upload failed");
          const uploadData = await res.json();
          
          attachedFiles.push({ name: file.name, url: uploadData.secure_url });
        }
        await updateDoc(docRef, { 
          attachedFiles: arrayUnion(...attachedFiles) 
        });
      }

      setDuplicateConflict(null);
      reset();
      setFiles(null);
      onSuccess();
    } catch (error) {
      console.error("Error replacing document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{initialData ? "Edit Customer" : "Add New Customer"}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{initialData ? "Update customer record details." : "Enter details to create a new record."}</p>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Form Content */}
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        
        {/* Section 1: Hospital */}
        <section>
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Hospital className="w-3.5 h-3.5" /> Hospital Information
          </h3>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Search Hospital</label>
            <Input 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Clear the actual form value so they MUST click a valid option
                if (selectedHospital) {
                  setValue("hospitalName", "");
                }
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown so click events on the list can register
                setTimeout(() => setShowDropdown(false), 200);
              }}
              placeholder="e.g. Cleopatra Hospital (Must select from list)..."
              autoComplete="off"
              className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm"
            />
            <input type="hidden" {...register("hospitalName")} />
            {errors.hospitalName && <p className="text-red-500 text-xs mt-1.5">Please select a valid hospital from the list.</p>}
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
                {filteredHospitals.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No hospitals found.</div>
                ) : (
                  filteredHospitals.map((h, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => {
                        setValue("hospitalName", h.nameEN, { shouldValidate: true });
                        setSearch(h.nameEN);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{h.nameEN}</div>
                      {h.nameAR && <div className="text-[11px] text-gray-500 mt-0.5">{h.nameAR}</div>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Contact Info */}
        <section>
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Contact Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Employee Name</label>
              <Input {...register("employeeName")} placeholder="Dr. Ahmed Mohamed" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm" />
              {errors.employeeName && <p className="text-red-500 text-xs mt-1.5">{errors.employeeName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Position</label>
              <Input {...register("position")} placeholder="Chief of Surgery" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm" />
              {errors.position && <p className="text-red-500 text-xs mt-1.5">{errors.position.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                   Mobile
                </label>
                <Input {...register("mobileNumber")} placeholder="0123456789" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm tabular-nums" />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1.5">{errors.mobileNumber.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                   Email
                </label>
                <Input {...register("email")} type="email" placeholder="email@example.com" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm" />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Attachments */}
        <section>
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Attachments
          </h3>
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50/50 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
            <input 
              type="file" 
              multiple 
              onChange={(e) => setFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-400">PDF, Excel, JPG, or PNG (max. 10MB)</p>
          </div>
          
          {/* Existing Files */}
          {initialData?.attachedFiles && initialData.attachedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Existing Files</h4>
              <div className="space-y-2">
                {initialData.attachedFiles.map((f: any, idx: number) => {
                  // Inject Cloudinary fl_attachment flag without the extension (Cloudinary auto-appends it)
                  let downloadUrl = f.url;
                  if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
                    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
                    const cleanName = encodeURIComponent(nameWithoutExt);
                    downloadUrl = downloadUrl.replace('/upload/', `/upload/fl_attachment:${cleanName}/`);
                  }
                  
                  return (
                    <a 
                      key={`ext-${idx}`} 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg text-sm transition-colors group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-blue-700 font-medium truncate group-hover:underline">{f.name}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Newly Selected Files Preview */}
          {files && files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Files to Upload</h4>
              <div className="space-y-2">
                {Array.from(files).map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-700 truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </form>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 mt-auto">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700 font-medium">
          Cancel
        </Button>
        <Button type="submit" form="customer-form" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm px-6">
          {isSubmitting ? "Saving..." : (initialData ? "Update Customer" : "Save Customer")}
        </Button>
      </div>

      {/* Conflict Resolution Modal */}
      <Dialog.Root open={!!duplicateConflict} onOpenChange={(open) => !open && setDuplicateConflict(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-6 rounded-2xl shadow-xl z-[70] w-full max-w-[440px] border border-gray-100 animate-in zoom-in-95 fade-in duration-200">
            
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-gray-900 leading-tight">Duplicate Found</Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                  A customer with this identity already exists.
                </Dialog.Description>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-2 text-xs mb-1">
                <span className="text-gray-400 font-medium uppercase tracking-wide col-span-1">Matched On</span>
                <span className="font-semibold text-gray-700 col-span-2 truncate">{duplicateConflict?.newData.employeeName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-gray-400 font-medium uppercase tracking-wide col-span-1">Mobile / Email</span>
                <span className="font-semibold text-gray-700 col-span-2 truncate">
                  {duplicateConflict?.newData.mobileNumber} <br/> {duplicateConflict?.newData.email}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => setDuplicateConflict(null)} 
                className="w-full flex flex-col items-center text-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Cancel & Edit Form</span>
                <span className="text-xs text-gray-500">Go back to form and modify your inputs</span>
              </button>
              
              <button 
                onClick={handleReplace} 
                className="w-full flex flex-col items-center text-center p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group"
              >
                <span className="text-sm font-semibold text-red-600">Replace Existing Data</span>
                <span className="text-xs text-red-500/80 group-hover:text-red-600">Completely overwrite with new form data</span>
              </button>

              <button 
                onClick={() => {
                  /* Logic for "Edit Existing" would redirect or merge. 
                     For now we'll just close and let user replace or cancel, 
                     or run a specific merge update. */
                  setDuplicateConflict(null);
                }} 
                className="w-full flex flex-col items-center text-center p-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm mt-2"
              >
                <span className="text-sm font-semibold">View Existing Profile</span>
                <span className="text-xs text-white/80">Discard changes and view record</span>
              </button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
