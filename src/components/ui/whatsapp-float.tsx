'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageCircle } from 'lucide-react'

export function WhatsAppFloat() {
  const [isMinimized, setIsMinimized] = useState(true)

  const handleWhatsAppClick = () => {
    const phoneNumber = "1234567890" // Replace with actual WhatsApp business number
    const message = encodeURIComponent(
      "Hi! I found you through your website at Einstein Essay Tutors. I'd like to learn more about your academic writing services."
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={handleWhatsAppClick}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Einstein Essay Tutors</h3>
              <p className="text-xs opacity-90">Typically replies instantly</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              👋 Hi there! Welcome to Einstein Essay Tutors.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              How can we help you with your academic writing needs today?
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Quick questions:</p>
            <div className="space-y-1">
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 text-sm text-gray-700 transition-colors"
              >
                📝 How do I place an order?
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 text-sm text-gray-700 transition-colors"
              >
                💰 What are your pricing options?
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 text-sm text-gray-700 transition-colors"
              >
                ⏰ How fast can you deliver?
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-2 text-sm text-gray-700 transition-colors"
              >
                🎓 What subjects do you cover?
              </button>
            </div>
          </div>

          <Button 
            onClick={handleWhatsAppClick} 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Chat on WhatsApp
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We'll respond as soon as possible
          </p>
        </div>
      </div>
    </div>
  )
}