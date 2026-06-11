"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Keep all fields as strings to match HTML input values and avoid zodResolver type conflicts.
// Numeric validation is done with regex; conversion happens in onSubmit.
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  brand: z.string().min(1, { message: "Brand is required." }),
  price: z.string().regex(/^\d+(\.\d+)?$/, { message: "Price must be a positive number." }),
  stock: z.string().regex(/^\d+$/, { message: "Stock must be a non-negative integer." }),
  category: z.string().min(1, { message: "Category is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  processor: z.string().min(1, { message: "Processor spec is required." }),
  ram: z.string().min(1, { message: "RAM spec is required." }),
  storage: z.string().min(1, { message: "Storage spec is required." }),
  gpu: z.string().min(1, { message: "GPU spec is required." }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function NewProductPage() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      brand: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      processor: "",
      ram: "",
      storage: "",
      gpu: "",
    },
  });

  function onSubmit(values: ProductFormValues) {
    // Convert numeric string fields to numbers for API submission
    const payload = {
      ...values,
      price: parseFloat(values.price),
      stock: parseInt(values.stock, 10),
    };
    toast.success("Product submitted successfully!", {
      description: "Your product is now pending admin approval.",
    });
    console.log(payload);
    form.reset();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-2">Submit a new laptop listing to the marketplace.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. MacBook Pro 16"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apple">Apple</SelectItem>
                              <SelectItem value="dell">Dell</SelectItem>
                              <SelectItem value="hp">HP</SelectItem>
                              <SelectItem value="lenovo">Lenovo</SelectItem>
                              <SelectItem value="asus">ASUS</SelectItem>
                              <SelectItem value="razer">Razer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gaming">Gaming</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="student">Student/Everyday</SelectItem>
                              <SelectItem value="creator">Creator/Workstation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product description..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="processor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processor (CPU)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Intel Core i9-13900H" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gpu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graphics (GPU)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. NVIDIA RTX 4070" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RAM</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 32GB DDR5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="storage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1TB NVMe SSD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing &amp; Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload high-quality images of the laptop.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full text-lg h-12 rounded-xl">
                Submit Product
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
