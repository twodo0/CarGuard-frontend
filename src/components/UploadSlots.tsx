import { useState } from "react";
import { Upload, X } from "lucide-react";
import { ImageSlot } from "@/lib/dto";
import { getSlotLabel } from "@/lib/damage";
import { uploadImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SlotData {
  file: File | null;
  preview: string | null;
  imageId: number | null;
}

interface UploadSlotsProps {
  onComplete: (slots: { slot: ImageSlot; imageId: number }[]) => void;
}

const SLOT_ORDER: ImageSlot[] = ["FRONT", "REAR", "LEFT", "RIGHT"];

export function UploadSlots({ onComplete }: UploadSlotsProps) {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Record<ImageSlot, SlotData>>({
    FRONT: { file: null, preview: null, imageId: null },
    REAR: { file: null, preview: null, imageId: null },
    LEFT: { file: null, preview: null, imageId: null },
    RIGHT: { file: null, preview: null, imageId: null },
  });
  const [uploading, setUploading] = useState<ImageSlot | null>(null);

  const handleFileSelect = async (slot: ImageSlot, file: File) => {
    const preview = URL.createObjectURL(file);
    setSlots(prev => ({ 
      ...prev, 
      [slot]: { file, preview, imageId: null } 
    }));
    
    setUploading(slot);
    try {
      const { imageId } = await uploadImage(file);
      
      setSlots(prev => {
        const updated = {
          ...prev,
          [slot]: { ...prev[slot], imageId },
        };
        
        toast({ 
          title: `${getSlotLabel(slot)} 업로드 완료`, 
          description: `Image ID: ${imageId}` 
        });
        
        // Check if all 4 slots are uploaded
        const allUploaded = SLOT_ORDER.every(s => updated[s].imageId !== null);
        
        if (allUploaded) {
          const images = SLOT_ORDER.map(s => ({
            slot: s,
            imageId: updated[s].imageId!,
          }));
          onComplete(images);
        }
        
        return updated;
      });
    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
      setSlots(prev => ({ 
        ...prev, 
        [slot]: { file: null, preview: null, imageId: null } 
      }));
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    } finally {
      setUploading(null);
    }
  };

  const handleReset = (slot: ImageSlot) => {
    if (slots[slot].preview) {
      URL.revokeObjectURL(slots[slot].preview!);
    }
    setSlots(prev => ({ 
      ...prev, 
      [slot]: { file: null, preview: null, imageId: null } 
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {SLOT_ORDER.map((slot) => {
        const slotData = slots[slot];
        const isUploading = uploading === slot;

        return (
          <div
            key={slot}
            className="relative border-2 border-dashed border-border rounded-xl overflow-hidden bg-card hover:border-primary transition-colors"
          >
            <div className="aspect-video flex flex-col items-center justify-center p-4">
              {slotData.preview ? (
                <>
                  <img
                    src={slotData.preview}
                    alt={getSlotLabel(slot)}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <button
                    className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8 rounded-md flex items-center justify-center"
                    onClick={() => handleReset(slot)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {slotData.imageId && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      ID: {slotData.imageId}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm">업로딩 중...</div>
                    </div>
                  )}
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">{getSlotLabel(slot)}</span>
                  <span className="text-xs text-muted-foreground">클릭하여 선택</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(slot, file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
