'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { getApiUrl } from '@/lib/config'
import FormRenderer from './FormRenderer'
import PriceCalculator from './PriceCalculator'
import PaymentMethodSelector from './PaymentMethodSelector'
import { Loader2 } from 'lucide-react'

interface FormField {
  name: string
  label: string
  type: string
  description: string
  required: boolean
  config: any
  options: Array<{
    value: string
    text: string
    description: string
    price_multiplier: number
    price_addition: number
  }>
}

interface PricingTier {
  id: string
  name: string
  description: string
  base_price_per_page: number
  minimum_price: number
}

interface DeadlinePricing {
  id: string
  name: string
  description: string
  min_hours: number
  max_hours: number | null
  price_multiplier: number
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  type: string
  is_default: boolean
  icon_url: string
  config: any
}

interface FormConfiguration {
  fields: FormField[]
  form_fields: FormField[]
  pricing_tiers: PricingTier[]
  deadline_pricing: DeadlinePricing[]
  payment_methods: PaymentMethod[]
}

export default function DynamicOrderForm() {
  const [configuration, setConfiguration] = useState<FormConfiguration | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedPricingTier, setSelectedPricingTier] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [deadline, setDeadline] = useState<string>('')
  const [customerNotes, setCustomerNotes] = useState<string>('')
  const [priceData, setPriceData] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const { getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Load form configuration on mount
  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch(getApiUrl('get_form_configuration/'))
        if (!response.ok) {
          throw new Error('Failed to load form configuration')
        }
        const data = await response.json()
        setConfiguration(data)
        
        // Set default payment method
        const defaultPayment = data.payment_methods.find((pm: PaymentMethod) => pm.is_default)
        if (defaultPayment) {
          setSelectedPaymentMethod(defaultPayment.id)
        }
        
        // Set default pricing tier if only one exists
        if (data.pricing_tiers.length === 1) {
          setSelectedPricingTier(data.pricing_tiers[0].id)
        }
      } catch (error) {
        console.error('Error loading configuration:', error)
        toast({
          title: 'Error',
          description: 'Failed to load order form configuration',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguration()
  }, [toast])

  // Calculate price when form data changes
  useEffect(() => {
    if (configuration && selectedPricingTier && deadline) {
      calculatePrice()
    }
  }, [formData, selectedPricingTier, deadline, configuration])

  const calculatePrice = async () => {
    if (!selectedPricingTier || !deadline) return

    try {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      const response = await fetch(getApiUrl('calculate_price/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_data: formData,
          pricing_tier_id: selectedPricingTier,
          deadline_hours: Math.round(hoursUntilDeadline)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPriceData(data)
      }
    } catch (error) {
      console.error('Error calculating price:', error)
    }
  }

  const uploadFiles = async (orderId: string): Promise<void> => {
    if (files.length === 0) return

    const formData = new FormData()
    formData.append('order_id', orderId)
    
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })

    // Don&apos;t set Content-Type for FormData - browser will set it with boundary
    const headers = getAuthHeaders()
    delete headers['Content-Type']
    
    const response = await fetch(getApiUrl('upload_order_files/'), {
      method: 'POST',
      headers: headers,
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload files')
    }

    const result = await response.json()
    if (result.errors && result.errors.length > 0) {
      console.warn('Some files had upload errors:', result.errors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPricingTier || !selectedPaymentMethod || !deadline) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    // Validate required form fields
    const requiredFields = configuration?.fields.filter(field => field.required) || []
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name] === '') {
        toast({
          title: 'Validation Error',
          description: `${field.label} is required`,
          variant: 'destructive'
        })
        return
      }
    }

    setSubmitting(true)

    try {
      const response = await fetch(getApiUrl('create_order/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_data: formData,
          pricing_tier_id: selectedPricingTier,
          deadline: deadline,
          payment_method_id: selectedPaymentMethod,
          customer_notes: customerNotes
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Upload files if any exist
        if (files.length > 0) {
          try {
            await uploadFiles(data.order_id)
            toast({
              title: 'Order Created',
              description: `Your order ${data.order_number} has been created successfully with ${files.length} file${files.length > 1 ? 's' : ''}!`
            })
          } catch (fileError) {
            console.error('File upload error:', fileError)
            toast({
              title: 'Order Created',
              description: `Your order ${data.order_number} has been created successfully but some files failed to upload. You can try uploading them later.`,
              variant: 'default'
            })
          }
        } else {
          toast({
            title: 'Order Created',
            description: `Your order ${data.order_number} has been created successfully!`
          })
        }
        
        // Redirect to payment or order confirmation
        router.push(`/order-confirmation?order_id=${data.order_id}`)
      } else {
        throw new Error(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-700">Loading order form...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!configuration) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-destructive">Failed to load order form configuration</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dynamic Form Fields */}
      <FormRenderer
        fields={configuration.fields}
        formData={formData}
        onChange={setFormData}
        pricingTiers={configuration.pricing_tiers}
        selectedPricingTier={selectedPricingTier}
        onPricingTierChange={setSelectedPricingTier}
        deadline={deadline}
        onDeadlineChange={setDeadline}
        files={files}
        onFilesChange={setFiles}
      />

      {/* Customer Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border border-input rounded-md resize-none"
            rows={4}
            placeholder="Any specific instructions or requirements for your order..."
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Price Calculator */}
      {priceData && (
        <PriceCalculator
          priceData={priceData}
          deadlinePricing={configuration.deadline_pricing}
          formData={formData}
          fields={configuration.form_fields}
        />
      )}

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        paymentMethods={configuration.payment_methods}
        selected={selectedPaymentMethod}
        onSelect={setSelectedPaymentMethod}
      />

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting || !selectedPricingTier || !selectedPaymentMethod || !deadline}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                Place Order
                {priceData && (
                  <span className="ml-2 font-bold">
                    ${priceData.final_price}
                  </span>
                )}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}