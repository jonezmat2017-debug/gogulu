import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiImageUploadProps {
  bucket: string;
  folder?: string;
  onUploadComplete: (urls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
}

export default function MultiImageUpload({ 
  bucket, 
  folder = "", 
  onUploadComplete,
  currentImages = [],
  maxImages = 5
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select images to upload.");
      }

      const files = Array.from(event.target.files);
      
      if (images.length + files.length > maxImages) {
        toast({
          title: "Too many images",
          description: `Maximum ${maxImages} images allowed`,
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${folder}${Date.now()}_${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onUploadComplete(newImages);

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUploadComplete(newImages);
  };

  return (
    <div className="space-y-3">
      <Label>Product Images (Up to {maxImages})</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img 
              src={url} 
              alt={`Product ${index + 1}`} 
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
            {index === 0 && (
              <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                Main
              </div>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors h-32">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={uploadImage}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        First image will be used as the main product image
      </p>
    </div>
  );
}
