"use client";

import { useQuery, gql } from "@apollo/client";
import { 
  Users, 
  Activity, 
  Package,
  ShoppingCart,
  CalendarDays,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const GET_SYSTEM_LOGS = gql`
  query GetSystemLogs {
    getSystemLogs {
      id
      type
      message
      time
    }
  }
`;

export default function SystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_SYSTEM_LOGS, {
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
        Error loading logs: {error.message}
      </div>
    );
  }

  const logs = data?.getSystemLogs || [];

  // Filter logs based on search term and type
  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? log.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'USER': return <Users className="h-5 w-5 text-blue-500" />;
      case 'PRODUCT': return <Package className="h-5 w-5 text-purple-500" />;
      case 'ORDER': return <ShoppingCart className="h-5 w-5 text-green-500" />;
      default: return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'USER': return "bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-900/30";
      case 'PRODUCT': return "bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-900/30";
      case 'ORDER': return "bg-green-500/10 text-green-500 border-green-200 dark:border-green-900/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">System Logs</h1>
        <p className="text-muted-foreground">Detailed audit trail of all platform activities including user registrations, product updates, and orders.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs by keyword..." 
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button 
            variant={filterType === null ? "default" : "outline"} 
            onClick={() => setFilterType(null)}
            className="shrink-0 h-11"
          >
            All Logs
          </Button>
          <Button 
            variant={filterType === 'USER' ? "default" : "outline"} 
            onClick={() => setFilterType('USER')}
            className="shrink-0 h-11"
          >
            Users Only
          </Button>
          <Button 
            variant={filterType === 'PRODUCT' ? "default" : "outline"} 
            onClick={() => setFilterType('PRODUCT')}
            className="shrink-0 h-11"
          >
            Products Only
          </Button>
          <Button 
            variant={filterType === 'ORDER' ? "default" : "outline"} 
            onClick={() => setFilterType('ORDER')}
            className="shrink-0 h-11"
          >
            Orders Only
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="font-semibold text-lg">No logs found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-muted ml-6 pl-8 space-y-8">
              {filteredLogs.map((log: any) => {
                const date = new Date(parseInt(log.time));
                const isToday = date.toDateString() === new Date().toDateString();
                const dateString = isToday ? "Today" : date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[41px] top-1 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 shadow-sm z-10 transition-colors group-hover:border-primary">
                      {getActivityIcon(log.type)}
                    </span>
                    
                    {/* Content Card */}
                    <div className={`p-5 rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md ${getActivityColor(log.type).replace('text-', 'hover:border-').split(' ')[2]}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getActivityColor(log.type)}`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-foreground/90 font-medium leading-relaxed text-lg">
                            {log.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium shrink-0 bg-muted/50 px-3 py-1.5 rounded-lg h-fit">
                          <CalendarDays className="h-4 w-4" />
                          <span>{dateString} at {timeString}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
