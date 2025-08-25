'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getApiUrl } from '@/lib/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { CheckCircle, Clock, CreditCard, FileText, ArrowRight, Copy, ExternalLink } from 'lucide-react'

interface OrderDetails {
  order_id: string
  order_number: string
  final_price: number
  payment_method: {
    type: string
    name: string
    config: any
  }
}

function OrderConfirmationContent() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  
  const { user, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (!orderId) {
      router.push('/dashboard')
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(getApiUrl(`get_order_details/${orderId}/`), {
          headers: getAuthHeaders()
        })

        if (response.ok) {
          const data = await response.json()
          setOrderDetails({
            order_id: data.order_id,
            order_number: data.order_number,
            final_price: data.final_price,
            payment_method: {
              type: data.payment_method.type,
              name: data.payment_method.name,
              config: data.payment_method.config
            }
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch order details')
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load order details',
          variant: 'destructive'
        })
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, router, getAuthHeaders, toast])

  const handlePayment = async () => {
    if (!orderDetails) return

    setPaymentProcessing(true)

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
          cancel_url: window.location.href
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.payment_method === 'paypal_business') {
          // Redirect to PayPal for approval
          window.location.href = data.approval_url
        } else if (data.payment_method === 'paypal_personal') {
          // Open PayPal.me link
          window.open(data.payment_url, '_blank')
          
          toast({
            title: 'Payment Link Opened',
            description: data.instructions || 'Please complete your payment in the new window.'
          })
          
          // Show manual confirmation dialog
          setTimeout(() => {
            handleManualPaymentConfirmation()
          }, 3000)
        } else if (data.payment_method === 'manual') {
          // Show payment instructions
          showManualPaymentInstructions(data)
        }
      } else {
        throw new Error(data.error || 'Payment initiation failed')
      }
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleManualPaymentConfirmation = () => {
    const reference = prompt('Please enter your payment reference/transaction ID (optional):')
    
    if (reference !== null) { // User didn't cancel
      confirmManualPayment(reference || '')
    }
  }

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
          payment_reference: reference
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Payment Submitted',
          description: data.message || 'Your payment confirmation has been submitted for verification.'
        })
        router.push('/dashboard')
      } else {
        throw new Error(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm payment',
        variant: 'destructive'
      })
    }
  }

  const showManualPaymentInstructions = (data: any) => {
    alert(`Payment Instructions:\n\n${data.instructions}\n\nOrder Reference: ${data.order_reference}\nAmount: $${data.amount}`)
    handleManualPaymentConfirmation()
  }

  const copyOrderNumber = () => {
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.order_number)
      toast({
        title: 'Copied',
        description: 'Order number copied to clipboard'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
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
    )
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
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                <span className="font-semibold text-gray-800">Order Number</span>
                <div className="flex items-center gap-2">
                  <code className="bg-blue-100 px-3 py-2 rounded-lg border-2 border-blue-300 font-mono text-sm font-bold text-blue-800 shadow-sm">
                    {orderDetails.order_number}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyOrderNumber}
                    className="h-8 w-8 hover:bg-blue-200"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200 shadow-sm">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-3xl font-bold text-green-700">
                  ${orderDetails.final_price}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200 shadow-sm">
                <span className="font-semibold text-gray-800">Payment Method</span>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-medium">
                  {orderDetails.payment_method.name}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200 shadow-sm">
                <span className="font-semibold text-gray-800">Status</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 font-medium">
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
                <div>
                  <p className="text-gray-600 mb-4">
                    Click the button below to open PayPal.me and complete your payment.
                  </p>
                  <Button
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                    className="w-full"
                    size="lg"
                  >
                    Pay via PayPal.me
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-gray-600 mt-2">
                    After payment, it may take 1-2 hours for verification. You'll receive an email confirmation.
                  </p>
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
                      We'll assign your order to a qualified tutor who specializes in your subject area
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
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}