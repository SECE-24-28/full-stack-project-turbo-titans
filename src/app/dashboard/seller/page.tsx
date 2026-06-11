"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { Plus, Laptop, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const GET_MY_PRODUCTS = gql`
  query GetMyProducts {
    getMyProducts {
      id
      status
    }
  }
`;

export default function SellerDashboard() {
  const { data, loading, error } = useQuery(GET_MY_PRODUCTS, {
    fetchPolicy: "network-only"
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <p>Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  const products = data?.getMyProducts || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your laptop listings and track their approval status.
          </p>
        </div>
        <Link href="/dashboard/seller/new" className={buttonVariants({ className: "gap-2 shadow-md" })}>
          <Plus className="h-4 w-4" />
          Add New Laptop
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Listings</h3>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Approved (Live)</h3>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {products.filter((p: any) => p.status === 'APPROVED').length}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Review</h3>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">
            {products.filter((p: any) => p.status === 'PENDING').length}
          </div>
        </div>
      </div>
    </div>
  );
}
