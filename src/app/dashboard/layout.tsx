"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, gql } from "@apollo/client";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  PlusCircle, 
  BarChart,
  CheckCircle,
  Activity,
  Layers
} from "lucide-react";

const ME_QUERY = gql`
  query Me {
    me {
      id
      role
    }
  }
`;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data, loading } = useQuery(ME_QUERY);

  const role = data?.me?.role;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/30 md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight">Dashboard</h2>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-2">
          {loading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : role === 'ADMIN' ? (
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-primary uppercase tracking-wider">Admin Portal</h3>
              <Link href="/dashboard/admin" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname === '/dashboard/admin' ? 'bg-accent text-accent-foreground' : ''}`}>
                <Activity className="h-4 w-4" />
                Overview
              </Link>
              <Link href="/dashboard/admin/approvals" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/approvals') ? 'bg-accent text-accent-foreground' : ''}`}>
                <CheckCircle className="h-4 w-4" />
                Approval Window
              </Link>
              <Link href="/dashboard/admin/users" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/users') ? 'bg-accent text-accent-foreground' : ''}`}>
                <Users className="h-4 w-4" />
                User Management
              </Link>
              <Link href="/dashboard/admin/analytics" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/analytics') ? 'bg-accent text-accent-foreground' : ''}`}>
                <BarChart className="h-4 w-4" />
                Realtime Analytics
              </Link>
              <Link href="/dashboard/admin/logs" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/logs') ? 'bg-accent text-accent-foreground' : ''}`}>
                <Activity className="h-4 w-4" />
                System Logs
              </Link>
              <Link href="/dashboard/admin/orders" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/orders') ? 'bg-accent text-accent-foreground' : ''}`}>
                <Package className="h-4 w-4" />
                Order Fulfillment
              </Link>
              <Link href="/dashboard/admin/inventory" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/inventory') ? 'bg-accent text-accent-foreground' : ''}`}>
                <Layers className="h-4 w-4" />
                Live Inventory
              </Link>
            </div>
          ) : role === 'SELLER' ? (
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller Portal</h3>
              <Link href="/dashboard/seller" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname === '/dashboard/seller' ? 'bg-accent text-accent-foreground' : ''}`}>
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Link>
              <Link href="/dashboard/seller/products" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/products') ? 'bg-accent text-accent-foreground' : ''}`}>
                <Package className="h-4 w-4" />
                My Products
              </Link>
              <Link href="/dashboard/seller/new" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-primary ${pathname.includes('/new') ? 'bg-accent text-accent-foreground' : ''}`}>
                <PlusCircle className="h-4 w-4" />
                Add Product
              </Link>
              <Link href="/dashboard/seller/orders" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/orders') ? 'bg-accent text-accent-foreground' : ''}`}>
                <ShoppingCart className="h-4 w-4" />
                Orders
              </Link>
              <Link href="/dashboard/seller/analytics" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${pathname.includes('/analytics') ? 'bg-accent text-accent-foreground' : ''}`}>
                <BarChart className="h-4 w-4" />
                Analytics
              </Link>
              <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground mt-4 border-t pt-4">
                <Users className="h-4 w-4" />
                Manage Profile
              </Link>
            </div>
          ) : (
             <div className="px-4 py-2 text-sm text-muted-foreground">Unauthorized Access</div>
          )}
        </nav>
      </aside>
      
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
