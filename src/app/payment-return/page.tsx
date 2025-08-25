'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getApiUrl } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function PaymentReturnContent() {
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [captureAttempted, setCaptureAttempted] = useState(false)
  
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const paymentId = searchParams.get('token') // PayPal returns 'token' parameter
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (captureAttempted) return // Prevent multiple capture attempts
    
    const capturePayment = async () => {
      console.log('Payment return params:', {
        paymentId,
        orderId,
        allParams: Object.fromEntries(searchParams.entries())
      })
      
      if (!paymentId) {
        setError('Missing PayPal payment ID (token parameter)')
        setProcessing(false)
        return
      }
      
      setCaptureAttempted(true) // Mark capture as attempted
      
      // Order ID is optional - the backend can find the order by payment_id

      try {
        const response = await fetch(getApiUrl('capture_paypal_payment/'), {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId || null,
            payment_id: paymentId
          })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSuccess(true)
          setOrderNumber(data.order_number)
          toast({
            title: 'Payment Successful',
            description: `Your payment has been processed successfully! Order ${data.order_number} is now confirmed.`
          })
        } else {
          throw new Error(data.error || 'Payment capture failed')
        }
      } catch (error) {
        console.error('Payment capture error:', error)
        setError(error instanceof Error ? error.message : 'Payment processing failed')
        toast({
          title: 'Payment Error',
          description: 'There was an error processing your payment. Please contact support.',
          variant: 'destructive'
        })
      } finally {
        setProcessing(false)
      }
    }

    capturePayment()
  }, [paymentId, orderId, captureAttempted]) // Removed unstable dependencies

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment with PayPal...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-700">
              Your payment has been processed successfully.
            </p>
            {orderNumber && (
              <p className="font-medium">
                Order <code className="bg-green-100 px-3 py-2 rounded-lg border-2 border-green-300 font-mono text-sm font-bold text-green-800 shadow-sm">
                  {orderNumber}
                </code> is now confirmed!
              </p>
            )}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/order" className="flex-1">
                <Button variant="outline" className="w-full">
                  New Order
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-700">
            {error || 'There was an error processing your payment.'}
          </p>
          <p className="text-sm text-gray-600">
            Please try again or contact our support team for assistance.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Dashboard
              </Button>
            </Link>
            <Button 
              onClick={() => router.back()} 
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600">
              Please wait while we process your payment information...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  )
}