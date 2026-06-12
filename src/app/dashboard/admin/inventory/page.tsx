"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, MonitorX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const GET_LIVE_INVENTORY = gql`
  query GetLiveInventory {
    getLiveInventory {
      id
      name
      brand
      price
      stock
      images
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

export default function AdminLiveInventoryPage() {
  const { data, loading, error, refetch } = useQuery(GET_LIVE_INVENTORY, {
    fetchPolicy: "network-only"
  });

  const [updateStatus] = useMutation(UPDATE_PRODUCT_STATUS);

  const handleDelist = async (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the details page if they just click the button
    
    if (!confirm(`Are you sure you want to forcibly delist "${name}"? It will immediately be hidden from the public marketplace.`)) {
      return;
    }
    
    try {
      await updateStatus({ variables: { id, status: "REJECTED" } });
      refetch();
    } catch (err: any) {
      toast.error("Failed to delist product: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        Error loading inventory: {error.message}
      </div>
    );
  }

  const products = data?.getLiveInventory || [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          Live Inventory Management 
        </h1>
        <p className="text-muted-foreground">Monitor all active laptops currently being sold on Lap Mart. Click any laptop to view full details or forcefully delist items that violate platform policies.</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <MonitorX className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Active Inventory</h2>
          <p className="text-muted-foreground">There are no approved laptops currently live on the marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link 
              key={product.id} 
              href={`/dashboard/admin/inventory/${product.id}`}
              className="flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all group cursor-pointer"
            >
              <div className="relative h-48 w-full bg-muted border-b">
                <Image
                  src={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Live
                </div>
              </div>
              
              <div className="flex flex-col flex-1 p-5">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.brand}</span>
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-lg">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-muted-foreground font-medium">{product.stock} in stock</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-dashed space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Seller: <span className="font-medium text-foreground">{product.seller.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={(e) => handleDelist(product.id, product.name, e)}
                      variant="destructive" 
                      className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Delist
                    </Button>
                    <div className="flex items-center justify-center px-4 rounded-md border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
