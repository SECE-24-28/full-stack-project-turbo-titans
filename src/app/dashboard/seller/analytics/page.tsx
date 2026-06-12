"use client";

import { useQuery, gql } from "@apollo/client";
import { AlertCircle, TrendingUp, IndianRupee, Star, Package } from "lucide-react";
import { SalesChart } from "@/components/seller/SalesChart";

const GET_SELLER_ANALYTICS = gql`
  query GetSellerAnalytics {
    getSellerAnalytics {
      totalRevenue
      salesLast30Days
      totalOrders
      topModel
      monthlyRevenue {
        name
        total
        orders
      }
    }
  }
`;

export default function AnalyticsPage() {
  const { data, loading, error } = useQuery(GET_SELLER_ANALYTICS, {
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
        <p>Error loading analytics: {error.message}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Note: You may need to restart your Next.js development server to apply recent database updates.
        </p>
      </div>
    );
  }

  const analytics = data?.getSellerAnalytics;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your sales performance and top selling models.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">₹{analytics?.totalRevenue.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Last 30 Days</h3>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">₹{analytics?.salesLast30Days.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Orders</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {analytics?.totalOrders || 0}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Top Model</h3>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-lg font-bold truncate">
            {analytics?.topModel || "N/A"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Revenue Overview (Year)</h3>
        <SalesChart data={analytics?.monthlyRevenue || []} />
      </div>

    </div>
  );
}
