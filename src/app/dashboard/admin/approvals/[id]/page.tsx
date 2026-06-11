"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, X, ArrowLeft, Info, Calendar, Shield, Cpu, HardDrive, Monitor, Battery, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      brand
      modelNumber
      series
      description
      processor
      ram
      storage
      graphics
      displaySize
      displayRes
      os
      battery
      price
      stock
      images
      warrantyPeriod
      warrantyType
      status
      createdAt
      seller {
        name
        email
      }
    }
  }
`;

const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($id: ID!, $status: String!) {
    updateProductStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function AdminApprovalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
    fetchPolicy: "network-only"
  });

  const [updateStatus] = useMutation(UPDATE_PRODUCT_STATUS);

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ variables: { id, status } });
      alert(`Product ${status.toLowerCase()} successfully!`);
      router.push("/dashboard/admin/approvals");
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data?.getProduct) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/admin/approvals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Approvals
          </Link>
        </Button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          Error loading product: {error?.message || "Product not found"}
        </div>
      </div>
    );
  }

  const product = data.getProduct;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Listing</h1>
          <p className="text-muted-foreground text-sm">Please verify the details before publishing to the live marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="relative h-64 w-full bg-muted">
              <Image
                src={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-4 border-t bg-muted/10">
                {product.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted border">
                    <Image src={img} alt={`Thumbnail ${i+1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Admin Actions
            </h3>
            
            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => handleStatusChange("APPROVED")}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12 text-md"
                disabled={product.status === "APPROVED"}
              >
                <Check className="h-5 w-5" />
                {product.status === "APPROVED" ? "Already Approved" : "Approve & Publish"}
              </Button>
              <Button 
                onClick={() => handleStatusChange("REJECTED")}
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2 border-red-200 dark:border-red-900/30 h-12 text-md"
                disabled={product.status === "REJECTED"}
              >
                <X className="h-5 w-5" />
                Reject Listing
              </Button>
            </div>
          </div>
          
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
             <h3 className="font-semibold text-lg flex items-center gap-2">
               <Info className="h-5 w-5 text-muted-foreground" />
               Listing Information
             </h3>
             <ul className="space-y-3 text-sm">
               <li className="flex justify-between items-center py-1 border-b">
                 <span className="text-muted-foreground">Submitted By</span>
                 <span className="font-medium text-right">{product.seller.name}<br/><span className="text-xs text-muted-foreground">{product.seller.email}</span></span>
               </li>
               <li className="flex justify-between items-center py-1 border-b">
                 <span className="text-muted-foreground">Date Submitted</span>
                 <span className="font-medium">{new Date(parseInt(product.createdAt)).toLocaleDateString()}</span>
               </li>
               <li className="flex justify-between items-center py-1 border-b">
                 <span className="text-muted-foreground">Requested Price</span>
                 <span className="font-bold text-primary text-lg">₹{product.price.toLocaleString('en-IN')}</span>
               </li>
               <li className="flex justify-between items-center py-1">
                 <span className="text-muted-foreground">Inventory Stock</span>
                 <span className="font-medium">{product.stock} Units</span>
               </li>
             </ul>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                {product.brand}
              </span>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
              <p className="text-xl text-muted-foreground">
                Model: {product.modelNumber} {product.series && `| Series: ${product.series}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 py-8 border-y">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Processor</h4>
                    <p className="text-muted-foreground">{product.processor}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Memory & Storage</h4>
                    <p className="text-muted-foreground">{product.ram} • {product.storage}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Display</h4>
                    <p className="text-muted-foreground">{product.displaySize} ({product.displayRes})</p>
                    <p className="text-muted-foreground text-xs mt-1">{product.graphics}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Box className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Operating System</h4>
                    <p className="text-muted-foreground">{product.os}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Battery className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Battery</h4>
                    <p className="text-muted-foreground">{product.battery || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Warranty</h4>
                    <p className="text-muted-foreground">{product.warrantyPeriod || "Not specified"} ({product.warrantyType || "N/A"})</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
