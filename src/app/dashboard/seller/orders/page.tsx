"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function SellerOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage laptop orders from your customers.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You haven't received any orders for your laptops yet. Make sure your listings are active and approved!
        </p>
        <Link href="/dashboard/seller/products" className={buttonVariants({ variant: "outline" })}>
          Manage My Products
        </Link>
      </div>
    </div>
  );
}
