'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  User,
  CreditCard,
  Download,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  final_price: number;
  deadline: string;
  created_at: string;
  payment_status: string;
  form_data_display: Record<string, string>;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_spent: 0,
  });

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Animated counters for statistics
  const animatedTotalOrders = useAnimatedCounter(stats.total_orders, {
    duration: 2000,
    delay: 100,
  });
  const animatedPendingOrders = useAnimatedCounter(stats.pending_orders, {
    duration: 1800,
    delay: 300,
  });
  const animatedCompletedOrders = useAnimatedCounter(stats.completed_orders, {
    duration: 2200,
    delay: 500,
  });
  const animatedTotalSpent = useAnimatedCounter(stats.total_spent, {
    duration: 2500,
    delay: 700,
    decimals: 2,
  });

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const response = await fetch(getApiUrl('get_user_orders/'), {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);

          // Calculate stats
          const total = data.orders.length;
          const pending = data.orders.filter((o: Order) =>
            ['pending_payment', 'confirmed', 'in_progress'].includes(o.status)
          ).length;
          const completed = data.orders.filter((o: Order) => o.status === 'delivered').length;
          const totalSpent = data.orders
            .filter((o: Order) => o.payment_status === 'paid')
            .reduce((sum: number, o: Order) => sum + o.final_price, 0);

          setStats({
            total_orders: total,
            pending_orders: pending,
            completed_orders: completed,
            total_spent: totalSpent,
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, getAuthHeaders, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'confirmed':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const sanitizedStatus = status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    switch (status) {
      case 'pending_payment':
        return <Badge variant="warning">{sanitizedStatus}</Badge>;
      case 'confirmed':
        return <Badge variant="info">{sanitizedStatus}</Badge>;
      case 'in_progress':
        return <Badge variant="info">{sanitizedStatus}</Badge>;
      case 'completed':
        return <Badge variant="success">{sanitizedStatus}</Badge>;
      case 'delivered':
        return <Badge variant="success">{sanitizedStatus}</Badge>;
      default:
        return <Badge variant="secondary">{sanitizedStatus}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {user?.username}! Here's an overview of your orders.
                </p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                {(user?.is_staff || user?.is_superuser) && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/order">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 transition-all duration-300">
                    {animatedTotalOrders}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 transition-all duration-300">
                    {animatedPendingOrders}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 transition-all duration-300">
                    {animatedCompletedOrders}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 transition-all duration-300">
                    ${animatedTotalSpent}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>
                  Track the progress of your academic writing orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by placing your first order with our expert tutors
                    </p>
                    <Link href="/order">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Place Your First Order
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Link key={order.id} href={`/order/${order.id}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm group cursor-pointer">
                          <div className="flex items-start space-x-4">
                            <div className="mt-1">{getStatusIcon(order.status)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-500 group-hover:text-gray-900">
                                  Order #{order.order_number}
                                </p>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="text-sm text-gray-700 group-hover:text-gray-800 space-y-1">
                                {Object.entries(order.form_data_display)
                                  .slice(0, 2)
                                  .map(([key, value]) => (
                                    <p key={key}>
                                      <span className="font-medium">{key}:</span> {value}
                                    </p>
                                  ))}
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                                <span>
                                  Deadline: {new Date(order.deadline).toLocaleDateString()}
                                </span>
                                <span>
                                  Placed: {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-600">
                                ${order.final_price}
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                View Details
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/order" className="block">
                    <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm group">
                      <Plus className="h-8 w-8 text-blue-600 mr-4" />
                      <div>
                        <h3 className="font-medium text-gray-500 group-hover:text-gray-900">
                          Place New Order
                        </h3>
                        <p className="text-sm text-gray-700 group-hover:text-gray-800">
                          Start a new academic writing project
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/profile">
                    <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm cursor-pointer group">
                      <User className="h-8 w-8 text-green-600 mr-4" />
                      <div>
                        <h3 className="font-medium text-gray-500 group-hover:text-gray-900">
                          Profile Settings
                        </h3>
                        <p className="text-sm text-gray-700 group-hover:text-gray-800">
                          Update your account information
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Link href="/support">
                    <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm cursor-pointer group">
                      <MessageSquare className="h-8 w-8 text-purple-600 mr-4" />
                      <div>
                        <h3 className="font-medium text-gray-500 group-hover:text-gray-900">
                          Support
                        </h3>
                        <p className="text-sm text-gray-700 group-hover:text-gray-800">
                          Get help from our support team
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
