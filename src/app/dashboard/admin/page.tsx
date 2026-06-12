"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { 
  Users, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  BarChart, 
  ArrowRight,
  Package,
  ShoppingCart,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GET_ADMIN_ANALYTICS = gql`
  query GetAdminAnalytics {
    getAdminAnalytics {
      totalRevenue
      activeUsers
      activeSellers
      pendingApprovals
      recentActivity {
        id
        type
        message
        time
      }
    }
  }
`;

export default function AdminDashboardPage() {
  const { data, loading, error } = useQuery(GET_ADMIN_ANALYTICS, {
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
        Error loading admin data: {error.message}
      </div>
    );
  }

  const stats = data?.getAdminAnalytics || {
    totalRevenue: 0,
    activeUsers: 0,
    activeSellers: 0,
    pendingApprovals: 0,
    recentActivity: []
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'USER': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'PRODUCT': return <Package className="h-4 w-4 text-purple-500" />;
      case 'ORDER': return <ShoppingCart className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Platform Overview</h1>
          <p className="text-muted-foreground">Monitor the pulse of Lap Mart in real-time.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/admin/approvals" className="block">
            <Button>
              Review Approvals
              {stats.pendingApprovals > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {stats.pendingApprovals}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime Platform Revenue</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSellers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Sellers on the platform</p>
          </CardContent>
        </Card>
        
        <Card className={`hover:border-primary/50 transition-colors ${stats.pendingApprovals > 0 ? "border-destructive/50 shadow-sm shadow-destructive/10" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stats.pendingApprovals > 0 ? "bg-destructive/10" : "bg-muted"}`}>
              <AlertCircle className={`h-4 w-4 ${stats.pendingApprovals > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingApprovals > 0 ? "text-destructive" : ""}`}>
              {stats.pendingApprovals}
            </div>
            <p className={`text-xs mt-1 ${stats.pendingApprovals > 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {stats.pendingApprovals > 0 ? "Requires immediate action" : "All caught up"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-primary/5 border-none shadow-none h-full">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome back to the Admin Portal!</h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8 text-lg">
                You have complete control over the Lap Mart marketplace. Monitor real-time growth, review seller submissions, and manage all users securely from this dashboard.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard/admin/approvals" className="group rounded-xl border bg-background p-5 hover:border-primary transition-all hover:shadow-md">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Approvals</h3>
                  <p className="text-sm text-muted-foreground">Review laptops</p>
                </Link>
                
                <Link href="/dashboard/admin/users" className="group rounded-xl border bg-background p-5 hover:border-primary transition-all hover:shadow-md">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Users</h3>
                  <p className="text-sm text-muted-foreground">Manage accounts</p>
                </Link>
                
                <Link href="/dashboard/admin/analytics" className="group rounded-xl border bg-background p-5 hover:border-primary transition-all hover:shadow-md">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View real-time data</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                {stats.recentActivity.length === 0 ? (
                   <p className="text-muted-foreground text-sm italic text-center py-4">No recent activity found.</p>
                ) : (
                  stats.recentActivity.map((activity: any) => {
                    const date = new Date(parseInt(activity.time));
                    // Check if it's today
                    const isToday = date.toDateString() === new Date().toDateString();
                    const timeString = isToday 
                      ? `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{activity.type}</span>
                            <time className="text-xs text-muted-foreground">{timeString}</time>
                          </div>
                          <div className="text-sm text-foreground/90 font-medium">
                            {activity.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <Link href="/dashboard/admin/logs" className="block w-full mt-6">
                <Button variant="ghost" className="w-full text-muted-foreground group">
                  View All Logs
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
