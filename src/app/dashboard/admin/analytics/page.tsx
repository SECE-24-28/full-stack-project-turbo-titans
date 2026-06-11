"use client";

import { useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      role
      createdAt
    }
  }
`;

export default function AdminAnalyticsPage() {
  const { data, loading, error } = useQuery(GET_ALL_USERS, {
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        Error loading analytics: {error.message}
      </div>
    );
  }

  const users = data?.getAllUsers || [];

  // Group users by month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Initialize data array with 0s for the last 6 months including current
  const chartData = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    chartData.push({
      name: monthNames[d.getMonth()],
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      buyers: 0,
      sellers: 0
    });
  }

  // Populate actual data from DB
  users.forEach((user: any) => {
    const date = new Date(parseInt(user.createdAt));
    const userMonth = date.getMonth();
    const userYear = date.getFullYear();
    
    // Find the matching bucket in our 6-month window
    const bucket = chartData.find(b => b.monthIndex === userMonth && b.year === userYear);
    if (bucket) {
      if (user.role === 'SELLER') {
        bucket.sellers += 1;
      } else if (user.role === 'BUYER') {
        bucket.buyers += 1;
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Realtime Analytics</h1>
        <p className="text-muted-foreground">Monitor platform growth and user acquisition directly from the live database.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))'}} 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} 
                />
                <Legend />
                <Bar dataKey="buyers" name="New Buyers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sellers" name="New Sellers" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
