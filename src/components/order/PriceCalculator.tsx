'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, Clock, FileText, TrendingUp } from 'lucide-react'

interface DeadlinePricing {
  id: string
  name: string
  description: string
  min_hours: number
  max_hours: number | null
  price_multiplier: number
}

interface PriceData {
  base_price: number
  total_multiplier: number
  total_addition: number
  final_price: number
  pricing_breakdown: {
    pages: number
    price_per_page: number
    deadline_multiplier: number
    deadline_pricing: {
      name: string | null
      multiplier: number
    }
  }
}

interface PriceCalculatorProps {
  priceData: PriceData
  deadlinePricing: DeadlinePricing[]
  formData?: Record<string, any>
  fields?: Array<{
    name: string
    label: string
    options: Array<{
      value: string
      text: string
    }>
  }>
}

export default function PriceCalculator({ priceData, deadlinePricing, formData, fields }: PriceCalculatorProps) {
  const breakdown = priceData.pricing_breakdown

  // Get selected options with their display text
  const getSelectedOptions = () => {
    if (!formData || !fields) return []
    
    const selectedOptions: Array<{ fieldLabel: string; optionText: string }> = []
    
    fields.forEach(field => {
      const value = formData[field.name]
      if (value) {
        if (Array.isArray(value)) {
          // Handle checkbox/multi-select
          value.forEach(val => {
            const option = field.options.find(opt => opt.value === val)
            if (option) {
              selectedOptions.push({
                fieldLabel: field.label,
                optionText: option.text
              })
            }
          })
        } else {
          // Handle single select/radio
          const option = field.options.find(opt => opt.value === value)
          if (option) {
            selectedOptions.push({
              fieldLabel: field.label,
              optionText: option.text
            })
          }
        }
      }
    })
    
    return selectedOptions
  }

  const selectedOptions = getSelectedOptions()

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-800">Base Price</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
              {breakdown.pages} page{breakdown.pages !== 1 ? 's' : ''} × ${breakdown.price_per_page}
            </Badge>
          </div>
          <span className="font-bold text-xl text-blue-700">${priceData.base_price}</span>
        </div>

        {/* Deadline Multiplier */}
        {breakdown.deadline_multiplier !== 1 && (
          <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-gray-800">Deadline Urgency</span>
              {breakdown.deadline_pricing.name && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  {breakdown.deadline_pricing.name}
                </Badge>
              )}
            </div>
            <span className="text-orange-700 font-bold text-lg">
              ×{breakdown.deadline_multiplier}
            </span>
          </div>
        )}

        {/* Additional Options */}
        {priceData.total_multiplier !== breakdown.deadline_multiplier && (
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-gray-800">Selected Options</span>
              </div>
              <span className="text-purple-700 font-bold text-lg">
                ×{(priceData.total_multiplier / breakdown.deadline_multiplier).toFixed(3)}
              </span>
            </div>
            {selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-800 border-purple-300 text-xs"
                  >
                    {option.optionText}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Additional Costs */}
        {priceData.total_addition > 0 && (
          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">Additional Services</span>
            </div>
            <span className="text-emerald-700 font-bold text-lg">
              +${priceData.total_addition}
            </span>
          </div>
        )}

        {/* Final Price */}
        <div className="flex justify-between items-center p-5 bg-green-100 rounded-lg border-3 border-green-300 shadow-md">
          <span className="text-xl font-bold text-green-800">Total Price</span>
          <span className="text-3xl font-bold text-green-800">
            ${priceData.final_price}
          </span>
        </div>

        {/* Price Explanation */}
        <div className="text-xs text-gray-700 space-y-1">
          <p>• Base price is calculated per page based on your selected academic level</p>
          <p>• Deadline urgency multiplier depends on how much time is available</p>
          <p>• Additional options may have their own multipliers or fixed costs</p>
          <p>• All prices are in USD and include professional writing and basic revisions</p>
        </div>
      </CardContent>
    </Card>
  )
}