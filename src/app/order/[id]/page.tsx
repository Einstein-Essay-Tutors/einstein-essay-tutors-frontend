'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import OrderFileManager from '@/components/order/OrderFileManager';
import OrderSolutionManager from '@/components/order/OrderSolutionManager';
import OrderReviewForm from '@/components/order/OrderReviewForm';
import {
  ArrowLeft,
  FileText,
  Clock,
  DollarSign,
  MessageSquare,
  Send,
  Calendar,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import Link from 'next/link';

interface OrderDetail {
  order_id: string;
  order_number: string;
  final_price: number;
  payment_method: {
    type: string;
    name: string;
    config: any;
  };
  status: string;
  payment_status: string;
  created_at: string;
  deadline: string;
  customer_notes: string;
  form_data: Record<string, any>;
  pricing_tier: {
    id: string;
    name: string;
    description: string;
  };
}

interface OrderMessage {
  id: number;
  message: string;
  sender_type: string; // 'customer', 'admin', 'writer'
  sender_name: string;
  created_at: string;
  is_read: boolean;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment states
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [capturingPayment, setCapturingPayment] = useState(false);

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
      fetchOrderMessages();
    }
  }, [orderId]);

  // Handle payment return from PayPal
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const token = searchParams.get('token'); // PayPal payment ID
    const payerId = searchParams.get('PayerID'); // PayPal payer ID

    // Handle custom payment status (success/cancelled)
    if (paymentStatus === 'success') {
      toast({
        title: 'Payment Successful',
        description:
          'Your payment has been processed successfully. Order status will be updated shortly.',
        variant: 'default',
      });
      // Clean URL
      router.replace(`/order/${orderId}`);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: 'Payment Cancelled',
        description: 'Payment was cancelled. You can try again anytime.',
        variant: 'destructive',
      });
      // Clean URL
      router.replace(`/order/${orderId}`);
    }

    // Handle PayPal return (automatic capture)
    if (token && payerId && orderId) {
      capturePayPalPayment(token);
    }
  }, [searchParams, router, orderId, toast]);

  const fetchOrderDetail = async () => {
    try {
      const response = await fetch(getApiUrl(`get_order_details/${orderId}/`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetail(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load order');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load order details',
        variant: 'destructive',
      });
    }
  };

  const fetchOrderMessages = async () => {
    try {
      const response = await fetch(getApiUrl(`get_order_messages/${orderId}/`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        // Messages might not exist yet, don't show error
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(getApiUrl('send_order_message/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchOrderMessages(); // Refresh messages
        toast({
          title: 'Message Sent',
          description: 'Your message has been sent successfully',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="h-4 w-4 text-orange-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return (
        'Today ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    } else if (diffDays === 2) {
      return (
        'Yesterday ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'admin':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'writer':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Student
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Admin
          </Badge>
        );
      case 'writer':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Writer
          </Badge>
        );
      default:
        return <Badge variant="secondary">{senderType}</Badge>;
    }
  };

  const initiatePayment = async () => {
    if (!orderDetail) return;

    setInitiatingPayment(true);
    try {
      const response = await fetch(getApiUrl('initiate_payment/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderDetail.order_id,
          return_url: `${window.location.origin}/order/${orderDetail.order_id}?payment=success`,
          cancel_url: `${window.location.origin}/order/${orderDetail.order_id}?payment=cancelled`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.payment_method === 'paypal_business' && data.approval_url) {
          // Redirect to PayPal for approval
          window.location.href = data.approval_url;
        } else if (data.payment_method === 'paypal_personal' || data.payment_method === 'manual') {
          // Show instructions modal
          setPaymentInstructions(data);
          setShowPaymentModal(true);
        }
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setInitiatingPayment(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const capturePayPalPayment = async (paymentId: string) => {
    setCapturingPayment(true);
    try {
      const response = await fetch(getApiUrl('capture_paypal_payment/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Payment Captured Successfully',
          description: data.message || 'Your PayPal payment has been processed successfully.',
          variant: 'default',
        });
        // Refresh order details to show updated status
        fetchOrderDetail();
      } else {
        // Log error but don't show user error immediately - they might have already paid
        console.error('PayPal capture error:', data.error);
        toast({
          title: 'Payment Processing',
          description: 'We are processing your payment. Please refresh the page in a few moments.',
          variant: 'default',
        });
      }

      // Clean URL regardless of success/failure
      router.replace(`/order/${orderId}`);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      toast({
        title: 'Payment Processing',
        description: 'We are processing your payment. Please refresh the page in a few moments.',
        variant: 'default',
      });
      // Clean URL
      router.replace(`/order/${orderId}`);
    } finally {
      setCapturingPayment(false);
    }
  };

  const confirmManualPayment = async (paymentRef: string) => {
    if (!paymentRef.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a payment reference',
        variant: 'destructive',
      });
      return;
    }

    setConfirmingPayment(true);
    try {
      const response = await fetch(getApiUrl('confirm_manual_payment/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderDetail?.order_id,
          payment_reference: paymentRef.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Payment Submitted',
          description: data.message || 'Payment confirmation submitted successfully',
          variant: 'default',
        });
        setShowPaymentModal(false);
        setPaymentInstructions(null);
        setPaymentReference('');
        // Refresh order details
        fetchOrderDetail();
      } else {
        throw new Error(data.error || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming manual payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm payment',
        variant: 'destructive',
      });
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (capturingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Processing your PayPal payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait, this may take a few moments.</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-destructive mb-4">{error || 'Order not found'}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{orderDetail.order_number}
                </h1>
                <p className="text-gray-600">Created {formatDate(orderDetail.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(orderDetail.status)}
              {getStatusBadge(orderDetail.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status Alert */}
              {orderDetail.payment_status !== 'paid' && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <div>
                          <h3 className="font-semibold text-orange-900">Payment Required</h3>
                          <p className="text-sm text-orange-700">
                            Complete your payment of ${orderDetail.final_price} to proceed with your
                            order.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={initiatePayment}
                        disabled={initiatingPayment}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {initiatingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Complete Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="font-medium text-gray-800">Order ID</span>
                        <code className="bg-blue-100 px-2 py-1 rounded text-xs sm:text-sm font-mono break-all">
                          {orderDetail.order_id}
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="font-medium text-gray-800">Total Price</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-700">
                          ${orderDetail.final_price}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <span className="font-medium text-gray-800">Payment Method</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 w-fit">
                          {orderDetail.payment_method.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <span className="font-medium text-gray-800 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Deadline
                        </span>
                        <span className="font-medium text-orange-800 text-sm sm:text-base">
                          {formatDate(orderDetail.deadline)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-800">Payment Status</span>
                        <Badge
                          variant={orderDetail.payment_status === 'paid' ? 'success' : 'warning'}
                          className="w-fit"
                        >
                          {orderDetail.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <span className="font-medium text-gray-800">Service Tier</span>
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 w-fit">
                          {orderDetail.pricing_tier?.name || 'Standard'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(orderDetail.form_data || {}).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(orderDetail.form_data || {}).map(([key, value]) => {
                        const formatValue = (key: string, value: any) => {
                          if (typeof value !== 'string') {
                            return JSON.stringify(value);
                          }

                          // Format specific fields that need title case treatment
                          if (
                            ['subject', 'paper_type', 'citation_style'].includes(key.toLowerCase())
                          ) {
                            return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          }

                          return value;
                        };

                        return (
                          <div key={key} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-gray-900 sm:text-right sm:max-w-[60%] break-words">
                                {formatValue(key, value)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No specific requirements specified</p>
                      <p className="text-xs">Standard order processing will apply</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Notes */}
              {orderDetail.customer_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {orderDetail.customer_notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Files */}
              <OrderFileManager orderId={orderId} readOnly={orderDetail.status === 'delivered'} />

              {/* Solution Files */}
              <OrderSolutionManager orderId={orderId} />

              {/* Order Review */}
              <OrderReviewForm orderId={orderId} onReviewSubmitted={fetchOrderDetail} />
            </div>

            {/* Right Column - Communication */}
            <div className="space-y-6">
              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {messages.length > 0 ? (
                        messages.map(message => (
                          <div
                            key={message.id}
                            className={`rounded-lg border ${
                              message.sender_type === 'customer'
                                ? 'bg-blue-50 border-blue-200 ml-4'
                                : 'bg-gray-50 border-gray-200 mr-4'
                            }`}
                          >
                            {/* Message Metadata Header */}
                            <div className="flex items-center justify-between px-3 py-2 bg-white bg-opacity-60 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                {getSenderIcon(message.sender_type)}
                                <span className="font-medium text-sm text-gray-700">
                                  {message.sender_name}
                                </span>
                                {getSenderBadge(message.sender_type)}
                              </div>
                              <span className="text-xs text-gray-500 font-medium">
                                {formatShortDate(message.created_at)}
                              </span>
                            </div>
                            {/* Message Content */}
                            <div className="p-3">
                              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No messages yet</p>
                          <p className="text-xs">Start a conversation with your team!</p>
                        </div>
                      )}
                    </div>

                    {/* New Message */}
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your message here..."
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="w-full"
                        >
                          {sendingMessage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions Modal */}
      {showPaymentModal && paymentInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Instructions -{' '}
                {paymentInstructions.payment_method === 'paypal_personal'
                  ? 'PayPal.me'
                  : 'Manual Payment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentInstructions.payment_method === 'paypal_personal' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">PayPal.me Payment Link</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Click the link below to complete your payment:
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => window.open(paymentInstructions.payment_url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Pay with PayPal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(paymentInstructions.payment_url, 'Payment link')
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {paymentInstructions.instructions && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Additional Instructions
                      </h3>
                      <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                        {paymentInstructions.instructions}
                      </p>
                    </div>
                  )}
                </>
              )}

              {paymentInstructions.payment_method === 'manual' && (
                <>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Bank Transfer Details</h3>
                    {paymentInstructions.bank_details && (
                      <div className="space-y-2 text-sm">
                        {Object.entries(paymentInstructions.bank_details).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="font-medium capitalize text-green-800">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-700">{value as string}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(value as string, key.replace(/_/g, ' '))
                                }
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Payment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">Amount:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700">${paymentInstructions.amount}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(`$${paymentInstructions.amount}`, 'Amount')
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">Reference:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-700 font-mono">
                            {paymentInstructions.order_reference}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(paymentInstructions.order_reference, 'Reference')
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentInstructions.instructions && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-2">Important Instructions</h3>
                      <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                        {paymentInstructions.instructions}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Complete your payment using the method above</li>
                  <li>• Keep your payment confirmation/reference</li>
                  <li>• We will verify your payment within 24 hours</li>
                  <li>• You&apos;ll receive an email confirmation once verified</li>
                  <li>• Your order will then move to "In Progress" status</li>
                </ul>
              </div>

              {/* Payment Confirmation Form */}
              {(paymentInstructions.payment_method === 'manual' ||
                paymentInstructions.payment_method === 'paypal_personal') && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-indigo-900 mb-3">Confirm Your Payment</h3>
                  <p className="text-sm text-indigo-700 mb-4">
                    Once you've completed the payment, provide your payment reference or transaction
                    ID below to notify us.
                  </p>
                  <div className="space-y-3">
                    <Input
                      placeholder={
                        paymentInstructions.payment_method === 'paypal_personal'
                          ? 'PayPal transaction ID (e.g., 1234567890ABCDEF)'
                          : 'Bank transfer reference or transaction ID'
                      }
                      value={paymentReference}
                      onChange={e => setPaymentReference(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      onClick={() => confirmManualPayment(paymentReference)}
                      disabled={!paymentReference.trim() || confirmingPayment}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {confirmingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Payment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentInstructions(null);
                    setPaymentReference('');
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => window.location.reload()}>Refresh Order Status</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
