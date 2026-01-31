import { VendorLayout } from "@/components/layout/VendorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    product: "Canon EOS R5 Camera",
    rentalDays: 7,
    total: 21000,
    status: "pending",
    createdAt: "2026-01-30",
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    product: "DJI Mavic 3 Pro Drone",
    rentalDays: 3,
    total: 9000,
    status: "confirmed",
    createdAt: "2026-01-29",
  },
  {
    id: "ORD-003",
    customerName: "Mike Johnson",
    product: "Sony A7 IV",
    rentalDays: 14,
    total: 28000,
    status: "active",
    createdAt: "2026-01-28",
  },
  {
    id: "ORD-004",
    customerName: "Emily Brown",
    product: 'MacBook Pro 16"',
    rentalDays: 5,
    total: 7500,
    status: "completed",
    createdAt: "2026-01-25",
  },
  {
    id: "ORD-005",
    customerName: "Alex Wilson",
    product: 'iPad Pro 12.9"',
    rentalDays: 2,
    total: 2000,
    status: "cancelled",
    createdAt: "2026-01-24",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Pending", variant: "secondary" as const, icon: Clock };
    case "confirmed":
      return {
        label: "Confirmed",
        variant: "default" as const,
        icon: CheckCircle2,
      };
    case "active":
      return { label: "Active", variant: "default" as const, icon: Truck };
    case "completed":
      return {
        label: "Completed",
        variant: "outline" as const,
        icon: CheckCircle2,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      return { label: status, variant: "secondary" as const, icon: Package };
  }
};

export default function VendorOrders() {
  return (
    <VendorLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your rental orders
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Order ID
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Customer
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Duration
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order, index) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-4 text-sm font-medium">
                            {order.id}
                          </td>
                          <td className="py-4 text-sm">{order.customerName}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {order.product}
                          </td>
                          <td className="py-4 text-sm">
                            {order.rentalDays} days
                          </td>
                          <td className="py-4 text-sm font-medium">
                            ₹{order.total.toLocaleString()}
                          </td>
                          <td className="py-4">
                            <Badge
                              variant={statusConfig.variant}
                              className="gap-1 rounded-lg"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorLayout>
  );
}
