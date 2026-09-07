import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, AlertTriangle, Plus, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import stringSimilarity from "string-similarity";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const hospitalSchema = z.object({
  nameEN: z.string().min(1, "English name is required"),
  nameAR: z.string().min(1, "Arabic name is required"),
  groupEN: z.string().min(1, "English group is required"),
  groupAR: z.string().min(1, "Arabic group is required"),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

export type HospitalDoc = {
  id?: string;
  nameEN: string;
  nameAR: string;
  groupEN: string;
  groupAR: string;
};

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hospital: HospitalDoc) => void;
  existingHospitals: HospitalDoc[];
}

export function AddHospitalModal({ isOpen, onClose, onSuccess, existingHospitals }: AddHospitalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarityWarning, setSimilarityWarning] = useState<{
    match: HospitalDoc;
    rating: number;
    pendingData: HospitalFormValues;
  } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
  });

  const checkSimilarityAndSubmit = async (data: HospitalFormValues) => {
    // Collect all existing names (EN and AR)
    if (existingHospitals.length > 0) {
      let bestMatchRating = 0;
      let bestMatchHospital: HospitalDoc | null = null;

      for (const h of existingHospitals) {
        if (!h.nameEN) continue;
        const enRating = stringSimilarity.compareTwoStrings(data.nameEN.toLowerCase(), h.nameEN.toLowerCase());
        const arRating = stringSimilarity.compareTwoStrings(data.nameAR, h.nameAR || "");
        
        const highestForH = Math.max(enRating, arRating);
        if (highestForH > bestMatchRating) {
          bestMatchRating = highestForH;
          bestMatchHospital = h;
        }
      }

      // If > 0.7, trigger warning
      if (bestMatchRating > 0.7 && bestMatchHospital) {
        setSimilarityWarning({
          match: bestMatchHospital,
          rating: bestMatchRating,
          pendingData: data
        });
        return;
      }
    }

    // No close match, proceed to save
    await saveNewHospital(data);
  };

  const saveNewHospital = async (data: HospitalFormValues) => {
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "hospitals"), {
        ...data,
        createdAt: new Date().toISOString()
      });
      const newHospital: HospitalDoc = { id: docRef.id, ...data };
      reset();
      setSimilarityWarning(null);
      onSuccess(newHospital);
    } catch (e) {
      console.error("Error adding hospital", e);
      alert("Failed to save new hospital");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    if (similarityWarning) {
      onSuccess(similarityWarning.match);
      reset();
      setSimilarityWarning(null);
    }
  };

  const handleProceedAnyhow = async () => {
    if (similarityWarning) {
      await saveNewHospital(similarityWarning.pendingData);
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => {
        if (!open) {
          reset();
          setSimilarityWarning(null);
          onClose();
        }
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-xl z-[70] w-full max-w-[480px] border border-gray-100 animate-in zoom-in-95 fade-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <Dialog.Title className="text-lg font-bold text-gray-900 leading-tight">Add New Hospital</Dialog.Title>
              <button onClick={() => {
                reset();
                setSimilarityWarning(null);
                onClose();
              }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="add-hospital-form" onSubmit={handleSubmit(checkSimilarityAndSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Hospital Name (English)</label>
                <Input {...register("nameEN")} placeholder="e.g. Cleopatra Hospital" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm" />
                {errors.nameEN && <p className="text-red-500 text-xs mt-1.5">{errors.nameEN.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Hospital Name (Arabic)</label>
                <Input {...register("nameAR")} placeholder="e.g. مستشفى كليوباترا" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm text-right" dir="auto" />
                {errors.nameAR && <p className="text-red-500 text-xs mt-1.5">{errors.nameAR.message}</p>}
              </div>

              <div className="pt-2 border-t border-gray-100"></div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Group Name (English)</label>
                <Input {...register("groupEN")} placeholder="e.g. Cleopatra Hospitals Group" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm" />
                {errors.groupEN && <p className="text-red-500 text-xs mt-1.5">{errors.groupEN.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Group Name (Arabic)</label>
                <Input {...register("groupAR")} placeholder="e.g. مجموعة مستشفيات كليوباترا" className="h-11 rounded-lg border-gray-200 focus-visible:ring-primary shadow-sm text-right" dir="auto" />
                {errors.groupAR && <p className="text-red-500 text-xs mt-1.5">{errors.groupAR.message}</p>}
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 mt-auto">
              <Button type="button" variant="ghost" onClick={() => {
                reset();
                setSimilarityWarning(null);
                onClose();
              }} className="text-gray-500 hover:text-gray-700 font-medium">
                Cancel
              </Button>
              <Button type="submit" form="add-hospital-form" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm px-6">
                {isSubmitting ? "Checking..." : "Add Hospital"}
              </Button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Similarity Warning Modal */}
      <Dialog.Root open={!!similarityWarning} onOpenChange={(open) => !open && setSimilarityWarning(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[80] animate-in fade-in" />
          <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-6 rounded-2xl shadow-xl z-[90] w-full max-w-[400px] border border-gray-100 animate-in zoom-in-95 fade-in duration-200">
            
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-gray-900 leading-tight">Similar Hospital Found</Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                  Did you mean this existing hospital?
                </Dialog.Description>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
              <div className="text-sm font-semibold text-gray-900 mb-1">{similarityWarning?.match.nameEN}</div>
              <div className="text-xs text-gray-500 mb-3">{similarityWarning?.match.nameAR}</div>
              <div className="text-xs bg-gray-200 px-2 py-1 rounded w-fit text-gray-700">Group: {similarityWarning?.match.groupEN}</div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button 
                onClick={handleUseExisting} 
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-semibold">Yes, use existing</span>
              </button>
              
              <button 
                onClick={handleProceedAnyhow} 
                disabled={isSubmitting}
                className="w-full flex flex-col items-center text-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">No, add my new one anyway</span>
              </button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
