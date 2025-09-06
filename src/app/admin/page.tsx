'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  FileText,
  DollarSign,
  Clock,
  UserPlus,
  Upload,
  MessageSquare,
  BarChart3,
  Loader2,
  Edit,
  Eye,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  total_orders: number;
  status_stats: Record<string, number>;
  payment_stats: Record<string, number>;
  total_revenue: number;
  recent_orders: number;
  assigned_orders: number;
  unassigned_orders: number;
  solution_stats: {
    total: number;
    pending_review: number;
    revision_requested: number;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  final_price: number;
  created_at: string;
  deadline: string;
  writer?: {
    id: number;
    name: string;
    email: string;
  };
  solution_count: number;
  current_solution_status?: string;
  revision_count: number;
  has_unread_messages: boolean;
}

interface Writer {
  id: number;
  name: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  assigned_orders: number;
  completed_solutions: number;
  date_joined: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Filters and search
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals and forms
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSolutionUploadModal, setShowSolutionUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Form states
  const [updateForm, setUpdateForm] = useState({
    status: '',
    payment_status: '',
    admin_notes: '',
  });
  const [assignWriterId, setAssignWriterId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [solutionFiles, setSolutionFiles] = useState<FileList | null>(null);
  const [solutionDescription, setSolutionDescription] = useState('');

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, writersRes] = await Promise.all([
        fetch(getApiUrl('api/admin/dashboard_stats/'), { headers: getAuthHeaders() }),
        fetch(getApiUrl('api/admin/writers_list/'), { headers: getAuthHeaders() }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (writersRes.ok) {
        const writersData = await writersRes.json();
        setWriters(writersData.writers);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '20',
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter && paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(getApiUrl(`api/admin/orders_list/?${params}`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotalPages(data.total_pages);
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setOrdersLoading(false);
    }
  }, [currentPage, statusFilter, paymentFilter, searchQuery, getAuthHeaders, toast]);

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_staff && !user.is_superuser) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (user && (user.is_staff || user.is_superuser)) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  useEffect(() => {
    if (user && (user.is_staff || user.is_superuser)) {
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          const params = new URLSearchParams({
            page: currentPage.toString(),
            page_size: '20',
          });

          if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
          if (paymentFilter && paymentFilter !== 'all')
            params.append('payment_status', paymentFilter);
          if (searchQuery) params.append('search', searchQuery);

          const response = await fetch(getApiUrl(`api/admin/orders_list/?${params}`), {
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            setOrders(data.orders);
            setTotalPages(data.total_pages);
          } else {
            console.error('Failed to fetch orders:', response.status, response.statusText);
            toast({
              title: 'Error',
              description: 'Failed to load orders',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: 'Error',
            description: 'Failed to load orders',
            variant: 'destructive',
          });
        } finally {
          setOrdersLoading(false);
        }
      };

      loadOrders();
    }
  }, [statusFilter, paymentFilter, searchQuery, currentPage, user, getAuthHeaders, toast]);

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(getApiUrl('api/admin/update_order/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          updates: updateForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Order Updated',
          description: data.message,
          variant: 'default',
        });
        setShowUpdateModal(false);
        fetchOrders();
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    }
  };

  const handleAssignWriter = async () => {
    if (!selectedOrder || !assignWriterId) return;

    try {
      const response = await fetch(getApiUrl('api/admin/update_order/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          updates: { assigned_writer_id: assignWriterId === 'unassigned' ? null : assignWriterId },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Writer Assigned',
          description: data.message,
          variant: 'default',
        });
        setShowAssignModal(false);
        fetchOrders();
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error assigning writer:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign writer',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedOrder || !messageText.trim()) return;

    try {
      const response = await fetch(getApiUrl('api/admin/send_message/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          message: messageText.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Message Sent',
          description: data.message,
          variant: 'default',
        });
        setShowMessageModal(false);
        setMessageText('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleUploadSolution = async () => {
    if (!selectedOrder || !solutionFiles || solutionFiles.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('order_id', selectedOrder.id);
      formData.append('description', solutionDescription.trim());

      // Append all files
      for (let i = 0; i < solutionFiles.length; i++) {
        formData.append('files', solutionFiles[i]);
      }

      // Don&apos;t set Content-Type for FormData - browser will set it with boundary
      const headers = getAuthHeaders();
      delete headers['Content-Type'];

      const response = await fetch(getApiUrl('api/admin/upload_solution/'), {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Solution Uploaded',
          description: 'Solution files have been uploaded successfully',
          variant: 'default',
        });
        setShowSolutionUploadModal(false);
        setSolutionFiles(null);
        setSolutionDescription('');
        fetchOrders(); // Refresh the orders list
      } else {
        throw new Error(data.error || 'Failed to upload solution');
      }
    } catch (error) {
      console.error('Error uploading solution:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload solution',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending_payment: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
    };

    return (
      <Badge
        className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <Badge
        className={colors[paymentStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'}
      >
        {paymentStatus}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || (!user.is_staff && !user.is_superuser)) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Manage orders, writers, and system operations</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/admin/django-admin" target="_blank">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Django Admin</span>
                <span className="sm:hidden">Django</span>
              </Button>
            </Link>
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manage Blogs</span>
                <span className="sm:hidden">Blogs</span>
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manage Reviews</span>
                <span className="sm:hidden">Reviews</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">User View</span>
                <span className="sm:hidden">View</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className=" shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-500">{stats.total_orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-500">
                      ${stats.total_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Unassigned Orders</p>
                    <p className="text-3xl font-bold text-gray-500">{stats.unassigned_orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Solutions</p>
                    <p className="text-3xl font-bold text-gray-500">
                      {stats.solution_stats.pending_review}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Management */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Orders Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders Table */}
            {ordersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Order</th>
                        <th className="text-left py-3 px-2">Customer</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Payment</th>
                        <th className="text-left py-3 px-2">Writer</th>
                        <th className="text-left py-3 px-2">Price</th>
                        <th className="text-left py-3 px-2">Deadline</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/order/${order.id}`)}
                        >
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-500">{order.order_number}</p>
                              <p className="text-sm text-gray-400">
                                {formatDate(order.created_at)}
                              </p>
                              {order.has_unread_messages && (
                                <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                  New Messages
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-500">{order.customer_name}</p>
                              <p className="text-sm text-gray-400">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {getStatusBadge(order.status)}
                            {order.current_solution_status && (
                              <p className="text-sm text-gray-400 mt-1">
                                Solution: {order.current_solution_status}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-2">{getPaymentBadge(order.payment_status)}</td>
                          <td className="py-3 px-2">
                            {order.writer ? (
                              <div>
                                <p className="font-medium text-gray-500">{order.writer.name}</p>
                                <p className="text-sm text-gray-400">{order.writer.email}</p>
                              </div>
                            ) : (
                              <Badge className="bg-gray-200 text-gray-800 border-gray-300">
                                Unassigned
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <p className="font-medium text-gray-500">${order.final_price}</p>
                          </td>
                          <td className="py-3 px-2">
                            <p className="text-sm text-gray-500">{formatDate(order.deadline)}</p>
                            {order.revision_count > 0 && (
                              <p className="text-sm text-orange-700 font-medium">
                                {order.revision_count} revisions
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setUpdateForm({
                                    status: order.status,
                                    payment_status: order.payment_status,
                                    admin_notes: '',
                                  });
                                  setShowUpdateModal(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setAssignWriterId(order.writer?.id.toString() || '');
                                  setShowAssignModal(true);
                                }}
                              >
                                <UserPlus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowMessageModal(true);
                                }}
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowSolutionUploadModal(true);
                                }}
                              >
                                <Upload className="h-3 w-3" />
                              </Button>
                              <Link href={`/order/${order.id}`} onClick={e => e.stopPropagation()}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                  {orders.map(order => (
                    <Card
                      key={order.id}
                      className="hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => router.push(`/order/${order.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(order.status)}
                            {getPaymentBadge(order.payment_status)}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.customer_name}
                            </p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Writer:</p>
                              {order.writer ? (
                                <p className="text-sm font-medium text-gray-900">
                                  {order.writer.name}
                                </p>
                              ) : (
                                <Badge className="bg-gray-200 text-gray-800 border-gray-300 text-xs">
                                  Unassigned
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Price:</p>
                              <p className="font-semibold text-gray-900">${order.final_price}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Deadline:</p>
                            <p className="text-sm text-gray-900">{formatDate(order.deadline)}</p>
                          </div>

                          {order.has_unread_messages && (
                            <Badge className="bg-red-100 text-red-800 text-xs">New Messages</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setUpdateForm({
                                status: order.status,
                                payment_status: order.payment_status,
                                admin_notes: '',
                              });
                              setShowUpdateModal(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setAssignWriterId(order.writer?.id.toString() || '');
                              setShowAssignModal(true);
                            }}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setShowSolutionUploadModal(true);
                            }}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Update Order Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Order: {selectedOrder.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={updateForm.status}
                    onValueChange={value => setUpdateForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Status</label>
                  <Select
                    value={updateForm.payment_status}
                    onValueChange={value =>
                      setUpdateForm(prev => ({ ...prev, payment_status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <Textarea
                    placeholder="Add admin notes..."
                    value={updateForm.admin_notes}
                    onChange={e =>
                      setUpdateForm(prev => ({ ...prev, admin_notes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateOrder}>Update Order</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assign Writer Modal */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Assign Writer: {selectedOrder.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Writer</label>
                  <Select value={assignWriterId} onValueChange={setAssignWriterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a writer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {writers.map(writer => (
                        <SelectItem key={writer.id} value={writer.id.toString()}>
                          {writer.name} ({writer.assigned_orders} orders)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignWriter}>Assign Writer</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Send Message Modal */}
        {showMessageModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Send Message: {selectedOrder.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Solution Upload Modal */}
        {showSolutionUploadModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Upload Solution: {selectedOrder.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Brief description of the solution..."
                    value={solutionDescription}
                    onChange={e => setSolutionDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Solution Files</label>
                  <Input
                    type="file"
                    multiple
                    onChange={e => setSolutionFiles(e.target.files)}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload solution files, plagiarism reports, AI reports, etc.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSolutionUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadSolution}
                    disabled={!solutionFiles || solutionFiles.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Solution
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
