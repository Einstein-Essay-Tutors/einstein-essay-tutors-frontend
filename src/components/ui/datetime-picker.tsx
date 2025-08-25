'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Globe } from 'lucide-react'

interface DateTimePickerProps {
  value: string
  onChange: (datetime: string) => void
  minDate?: Date
  required?: boolean
  label?: string
  description?: string
}

export default function DateTimePicker({
  value,
  onChange,
  minDate,
  required = false,
  label = "Date & Time",
  description
}: DateTimePickerProps) {
  const [userTimezone, setUserTimezone] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedTimezone, setSelectedTimezone] = useState<string>('')

  // Common timezone options
  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Central Europe (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
    { value: 'UTC', label: 'UTC' }
  ]

  // Detect user's timezone on component mount
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
    setSelectedTimezone(timezone)
  }, [])

  // Parse initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        // Format date as YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0]
        setSelectedDate(dateStr)
        
        // Format time as HH:MM
        const timeStr = date.toTimeString().split(' ')[0].substring(0, 5)
        setSelectedTime(timeStr)
      }
    }
  }, [value])

  // Update parent when date, time, or timezone changes
  useEffect(() => {
    if (selectedDate && selectedTime && selectedTimezone) {
      // Create datetime string that matches the expected format (YYYY-MM-DDTHH:mm)
      const dateTimeStr = `${selectedDate}T${selectedTime}`
      onChange(dateTimeStr)
    }
  }, [selectedDate, selectedTime, selectedTimezone, onChange])

  // Get minimum date string
  const getMinDate = () => {
    const min = minDate || new Date()
    return min.toISOString().split('T')[0]
  }

  // Get minimum time for today
  const getMinTime = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    if (selectedDate === today) {
      // Add 1 hour buffer for same day
      now.setHours(now.getHours() + 1)
      return now.toTimeString().split(' ')[0].substring(0, 5)
    }
    return '00:00'
  }

  // Format timezone display
  const getTimezoneDisplay = (timezone: string) => {
    const option = timezoneOptions.find(opt => opt.value === timezone)
    if (option) return option.label
    
    // Fallback for user's detected timezone
    if (timezone === userTimezone) {
      return `${timezone} (Your timezone)`
    }
    return timezone
  }

  // Calculate time difference
  const getTimezoneDifference = () => {
    if (!selectedDate || !selectedTime || !selectedTimezone || selectedTimezone === userTimezone) {
      return null
    }

    try {
      const dateTimeStr: string = `${selectedDate}T${selectedTime}:00`
      const selectedDateTime: Date = new Date(dateTimeStr)
      
      // Get time in user's timezone
      const userTime: string = selectedDateTime.toLocaleString('en-US', {
        timeZone: userTimezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Get time in selected timezone
      const selectedTimeFormatted: string = selectedDateTime.toLocaleString('en-US', {
        timeZone: selectedTimezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      if (userTime !== selectedTimeFormatted) {
        return `${userTime} in your timezone`
      }
    } catch (error) {
      console.error('Error calculating timezone difference:', error)
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-700">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date-picker" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </Label>
          <div className="relative group">
            <Input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              required={required}
              className="w-full pl-10 pr-8 
                [&::-webkit-calendar-picker-indicator]:absolute 
                [&::-webkit-calendar-picker-indicator]:left-36
                [&::-webkit-calendar-picker-indicator]:w-5 
                [&::-webkit-calendar-picker-indicator]:h-5 
                [&::-webkit-calendar-picker-indicator]:opacity-100 
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-calendar-picker-indicator]:bg-white
                [&::-webkit-calendar-picker-indicator]:rounded
                [&::-webkit-calendar-picker-indicator]:border
                [&::-webkit-calendar-picker-indicator]:border-gray-300
                [&::-webkit-calendar-picker-indicator]:hover:bg-blue-50
                [&::-webkit-calendar-picker-indicator]:hover:border-blue-400
                cursor-pointer
                hover:border-blue-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200"
              style={{
                colorScheme: 'light'
              }}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="time-picker" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </Label>
          <div className="relative group">
            <Input
              id="time-picker"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min={selectedDate === getMinDate() ? getMinTime() : '00:00'}
              required={required}
              className="w-full pl-10 pr-8
                [&::-webkit-calendar-picker-indicator]:absolute 
                [&::-webkit-calendar-picker-indicator]:left-34
                [&::-webkit-calendar-picker-indicator]:w-5 
                [&::-webkit-calendar-picker-indicator]:h-5 
                [&::-webkit-calendar-picker-indicator]:opacity-100 
                [&::-webkit-calendar-picker-indicator]:cursor-pointer
                [&::-webkit-calendar-picker-indicator]:bg-white
                [&::-webkit-calendar-picker-indicator]:rounded
                [&::-webkit-calendar-picker-indicator]:border
                [&::-webkit-calendar-picker-indicator]:border-gray-300
                [&::-webkit-calendar-picker-indicator]:hover:bg-blue-50
                [&::-webkit-calendar-picker-indicator]:hover:border-blue-400
                cursor-pointer
                hover:border-blue-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200"
              style={{
                colorScheme: 'light'
              }}
            />
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
          </div>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Timezone
          </Label>
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone} required={required}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {/* User's timezone first */}
              {userTimezone && !timezoneOptions.find(opt => opt.value === userTimezone) && (
                <>
                  <SelectItem value={userTimezone}>
                    <div className="flex items-center justify-between w-full">
                      <span>{userTimezone} (Your timezone)</span>
                      <Badge variant="default" className="ml-2">Detected</Badge>
                    </div>
                  </SelectItem>
                  <hr className="my-1" />
                </>
              )}
              
              {/* Common timezones */}
              {timezoneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.value === userTimezone && (
                      <Badge variant="default" className="ml-2">Your timezone</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Difference Display */}
        {getTimezoneDifference() && (
          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Time in your timezone:</span>
              <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-300">
                {getTimezoneDifference()}
              </Badge>
            </div>
          </div>
        )}

        {/* Selected DateTime Summary */}
        {selectedDate && selectedTime && selectedTimezone && (
          <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 mb-1">Selected deadline:</p>
                <p className="text-green-700">
                  {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {selectedTime}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Timezone: {getTimezoneDisplay(selectedTimezone)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}