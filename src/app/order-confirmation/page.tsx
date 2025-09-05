'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  ArrowRight,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface OrderDetails {
  order_id: string;
  order_number: string;
  final_price: number;
  payment_method: {
    type: string;
    name: string;
    config: any;
  };
}

function OrderConfirmationContent() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const fetchOrderDetails = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(getApiUrl(`get_order_details/${orderId}/`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails({
          order_id: data.order_id,
          order_number: data.order_number,
          final_price: data.final_price,
          payment_method: {
            type: data.payment_method.type,
            name: data.payment_method.name,
            config: data.payment_method.config,
          },
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load order details';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, getAuthHeaders, toast]);

  const retryLoadOrder = () => {
    setLoading(true);
    fetchOrderDetails();
  };

  useEffect(() => {
    if (!orderId) {
      router.push('/dashboard');
      return;
    }

    fetchOrderDetails();
  }, [orderId, router, fetchOrderDetails]);

  const handlePayment = async () => {
    if (!orderDetails) return;

    setPaymentProcessing(true);

    try {
      // Initiate payment through backend
      const response = await fetch(getApiUrl('initiate_payment/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderDetails.order_id,
          return_url: `${window.location.origin}/payment-return?order_id=${orderDetails.order_id}`,
          cancel_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.payment_method === 'paypal_business') {
          // Redirect to PayPal for approval
          window.location.href = data.approval_url;
        } else if (data.payment_method === 'paypal_personal') {
          // Open PayPal.me link
          window.open(data.payment_url, '_blank');

          toast({
            title: 'Payment Link Opened',
            description: data.instructions || 'Please complete your payment in the new window.',
          });

          // Show manual confirmation dialog
          setTimeout(() => {
            handleManualPaymentConfirmation();
          }, 3000);
        } else if (data.payment_method === 'manual') {
          // Show payment instructions
          showManualPaymentInstructions(data);
        }
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';

      toast({
        title: 'Payment Error',
        description: `${errorMessage}. Please try again or contact support if the problem persists.`,
        variant: 'destructive',
        duration: 7000, // Show error longer
      });

      // Log error for debugging
      console.error('Payment initiation error:', {
        error,
        orderId: orderDetails?.order_id,
        paymentMethod: orderDetails?.payment_method?.type,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleManualPaymentConfirmation = () => {
    const reference = prompt('Please enter your payment reference/transaction ID (optional):');

    if (reference !== null) {
      // User didn't cancel
      confirmManualPayment(reference || '');
    }
  };

  const confirmManualPayment = async (reference: string) => {
    try {
      const response = await fetch(getApiUrl('confirm_manual_payment/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderDetails?.order_id,
          payment_reference: reference,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Payment Submitted',
          description:
            data.message || 'Your payment confirmation has been submitted for verification.',
        });
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Failed to confirm payment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm payment',
        variant: 'destructive',
      });
    }
  };

  const showManualPaymentInstructions = (data: any) => {
    alert(
      `Payment Instructions:\n\n${data.instructions}\n\nOrder Reference: ${data.order_reference}\nAmount: $${data.amount}`
    );
    handleManualPaymentConfirmation();
  };

  const copyOrderNumber = () => {
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.order_number);
      toast({
        title: 'Copied',
        description: 'Order number copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-destructive mb-2">Failed to Load Order</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={retryLoadOrder} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">Order not found</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-800">
                Order Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-700">
                Your order has been submitted and is awaiting payment confirmation
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                <span className="font-semibold text-gray-800">Order Number</span>
                <div className="flex items-center gap-2">
                  <code className="bg-blue-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 border-blue-300 font-mono text-xs sm:text-sm font-bold text-blue-800 shadow-sm break-all">
                    {orderDetails.order_number}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyOrderNumber}
                    className="h-8 w-8 hover:bg-blue-200 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-green-50 rounded-lg border-2 border-green-200 shadow-sm">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl sm:text-3xl font-bold text-green-700">
                  ${orderDetails.final_price}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-purple-50 rounded-lg border-2 border-purple-200 shadow-sm">
                <span className="font-semibold text-gray-800">Payment Method</span>
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 border-purple-300 font-medium w-fit"
                >
                  {orderDetails.payment_method.name}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-orange-50 rounded-lg border-2 border-orange-200 shadow-sm">
                <span className="font-semibold text-gray-800">Status</span>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 border-orange-300 font-medium w-fit"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Payment
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Complete Your Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderDetails.payment_method.type === 'paypal_business' && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Click the button below to complete your payment securely through PayPal.
                  </p>
                  <Button
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay with PayPal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {orderDetails.payment_method.type === 'paypal_personal' && (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3">Payment Summary</h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-medium text-green-800">Order Number:</span>
                        <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono break-all">
                          {orderDetails.order_number}
                        </code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-medium text-green-800">Amount Due:</span>
                        <span className="text-lg font-bold text-green-700">
                          ${orderDetails.final_price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PayPal Payment Button */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">PayPal.me Payment</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Click the button below to complete your payment via PayPal:
                    </p>
                    <Button
                      onClick={handlePayment}
                      disabled={paymentProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                      size="lg"
                    >
                      {paymentProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Opening PayPal...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Pay ${orderDetails.final_price} with PayPal
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Payment Troubleshooting */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      Having trouble with payment?
                    </h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>• Ensure pop-ups are enabled for this site</p>
                      <p>• Check your PayPal account for sufficient funds</p>
                      <p>• Try refreshing the page and clicking the button again</p>
                      <p>• Contact our support team if issues persist</p>
                    </div>
                  </div>

                  {/* Important Instructions */}
                  <div className="bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-3">
                      🔔 Important: Add Your Order ID
                    </h3>
                    <div className="space-y-2 text-sm text-amber-800">
                      <p>
                        <strong>When making the PayPal payment, please:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Click "Add a note" or "What's this for?" in PayPal</li>
                        <li>
                          Enter your order number:{' '}
                          <code className="bg-amber-100 px-2 py-1 rounded font-mono">
                            {orderDetails.order_number}
                          </code>
                        </li>
                        <li>This helps us identify and process your payment quickly</li>
                      </ol>
                      <p className="mt-3 font-medium">
                        ⚡ Payments are typically processed within 1-2 hours during business hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Payment Confirmation</p>
                    <p className="text-gray-600">
                      Once payment is confirmed, your order status will be updated to "Confirmed"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Assignment to Tutor</p>
                    <p className="text-gray-600">
                      We&apos;ll assign your order to a qualified tutor who specializes in your
                      subject area
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Work in Progress</p>
                    <p className="text-gray-600">
                      Track your order progress in real-time through your dashboard
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-xs">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-gray-600">
                      Receive your completed work before the deadline with free revisions included
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/order" className="flex-1">
              <Button variant="ghost" className="w-full">
                Place Another Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
