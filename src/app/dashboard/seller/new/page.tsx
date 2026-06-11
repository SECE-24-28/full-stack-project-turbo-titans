"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $brand: String!
    $modelNumber: String!
    $series: String
    $description: String!
    $processor: String!
    $ram: String!
    $storage: String!
    $graphics: String!
    $displaySize: String!
    $displayRes: String!
    $os: String!
    $battery: String
    $price: Float!
    $stock: Int!
    $images: [String!]!
    $warrantyPeriod: String
    $warrantyType: String
  ) {
    createProduct(
      name: $name
      brand: $brand
      modelNumber: $modelNumber
      series: $series
      description: $description
      processor: $processor
      ram: $ram
      storage: $storage
      graphics: $graphics
      displaySize: $displaySize
      displayRes: $displayRes
      os: $os
      battery: $battery
      price: $price
      stock: $stock
      images: $images
      warrantyPeriod: $warrantyPeriod
      warrantyType: $warrantyType
    ) {
      id
    }
  }
`;

export default function AddLaptopPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "", brand: "", modelNumber: "", series: "", description: "",
    processor: "", ram: "", storage: "", graphics: "", displaySize: "", 
    displayRes: "", os: "", battery: "",
    price: "", stock: "",
    warrantyPeriod: "", warrantyType: ""
  });

  const [createProduct, { loading: isCreating }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      toast.success("Laptop listed successfully!", {
        description: "It is now pending review by an admin."
      });
      router.push("/dashboard/seller");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Failed to list laptop", { description: error.message });
      setIsUploading(false);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Create local preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Free memory
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload image: ${file.name}`);
      }
      
      const data = await response.json();
      uploadedUrls.push(data.url);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload all images first
      toast.info("Uploading images...");
      const imageUrls = await uploadImages();
      
      // 2. Submit product to GraphQL
      toast.info("Saving product details...");
      createProduct({
        variables: {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          images: imageUrls
        }
      });
      
    } catch (error: any) {
      toast.error("Error", { description: error.message });
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || isCreating;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/dashboard/seller" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">List a New Laptop</h1>
        <p className="text-muted-foreground mt-1">
          Provide detailed specifications and high-quality images to help buyers make informed decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">1. Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Laptop Title (e.g. Dell Inspiron 15 3000)</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" required placeholder="Dell, HP, Apple..." value={formData.brand} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input id="modelNumber" name="modelNumber" required value={formData.modelNumber} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Series (Optional)</Label>
              <Input id="series" name="series" value={formData.series} onChange={handleChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                rows={5}
                placeholder="Describe the laptop's condition, features, and target audience..."
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Specifications */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">2. Technical Specifications</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="processor">Processor (CPU)</Label>
              <Input id="processor" name="processor" required placeholder="Intel Core i5-1240P" value={formData.processor} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ram">RAM Size</Label>
              <Input id="ram" name="ram" required placeholder="16GB DDR4" value={formData.ram} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage</Label>
              <Input id="storage" name="storage" required placeholder="512GB NVMe SSD" value={formData.storage} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graphics">Graphics Card (GPU)</Label>
              <Input id="graphics" name="graphics" required placeholder="Intel Iris Xe / RTX 4060" value={formData.graphics} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displaySize">Display Size</Label>
              <Input id="displaySize" name="displaySize" required placeholder="15.6 inch" value={formData.displaySize} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayRes">Display Resolution</Label>
              <Input id="displayRes" name="displayRes" required placeholder="1920x1080 (FHD)" value={formData.displayRes} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="os">Operating System</Label>
              <Input id="os" name="os" required placeholder="Windows 11 Home" value={formData.os} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="battery">Battery (Optional)</Label>
              <Input id="battery" name="battery" placeholder="54Whr / 4-cell" value={formData.battery} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Section 3 & 5: Pricing, Stock & Warranty */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">3. Pricing & Stock</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="49999.00" value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Available Quantity</Label>
                <Input id="stock" name="stock" type="number" min="1" required placeholder="10" value={formData.stock} onChange={handleChange} />
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">4. Warranty Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warrantyPeriod">Warranty Period (Optional)</Label>
                <Input id="warrantyPeriod" name="warrantyPeriod" placeholder="1 Year / 6 Months" value={formData.warrantyPeriod} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyType">Warranty Type (Optional)</Label>
                <Input id="warrantyType" name="warrantyType" placeholder="Manufacturer / Seller" value={formData.warrantyType} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Images */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">5. Product Images</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 border-border transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium"><span className="text-primary">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max. 5MB per file)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
              </label>
            </div>
            
            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12 border-t">
          <Button 
            type="button" 
            variant="outline" 
            className="mr-4" 
            disabled={isLoading}
            onClick={() => router.push("/dashboard/seller")}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isLoading} className="gap-2 px-8">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Submit Laptop for Review
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
