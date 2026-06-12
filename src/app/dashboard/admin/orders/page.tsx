"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    getAllOrders {
      id
      totalAmount
      status
      createdAt
      buyer {
        name
        email
      }
      items {
        id
        quantity
        priceAtTime
        product {
          name
          brand
        }
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function AdminOrdersPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_ORDERS, {
    fetchPolicy: "network-only"
  });

  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ variables: { id, status } });
      refetch();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'PROCESSING': return <Package className="h-4 w-4 text-blue-500" />;
      case 'SHIPPED': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'DELIVERED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return "bg-orange-500/10 text-orange-500 border-orange-200 dark:border-orange-900/30";
      case 'PROCESSING': return "bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-900/30";
      case 'SHIPPED': return "bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-900/30";
      case 'DELIVERED': return "bg-green-500/10 text-green-500 border-green-200 dark:border-green-900/30";
      case 'CANCELLED': return "bg-red-500/10 text-red-500 border-red-200 dark:border-red-900/30";
      default: return "bg-muted text-muted-foreground";
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
        Error loading orders: {error.message}
      </div>
    );
  }

  const orders = data?.getAllOrders || [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Order Fulfillment</h1>
        <p className="text-muted-foreground">Manage and track all customer orders placed on the Lap Mart platform.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground">There are no orders on the platform currently.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-mono text-xs font-medium">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(parseInt(order.createdAt)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.buyer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="truncate max-w-[200px]">
                          {item.quantity}x {item.product.brand} {item.product.name}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 h-7 gap-1 px-2.5">
                        Update Status
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'PENDING')}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'PROCESSING')}>
                          Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'SHIPPED')}>
                          Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'DELIVERED')}>
                          Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="text-red-600">
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
