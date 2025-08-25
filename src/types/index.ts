export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  is_staff?: boolean
  is_superuser?: boolean
  date_joined?: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  is_staff?: boolean
  is_superuser?: boolean
  date_joined?: string
}

export interface Subject {
  id: string
  name: string
  code: string
  description: string
  icon?: string
}

export interface AcademicLevel {
  id: string
  name: string
}

export interface OrderType {
  id: string
  name: string
}

export interface FormattingStyle {
  id: string
  name: string
}

export interface Language {
  id: string
  name: string
}

export interface Order {
  id: string
  title: string
  description: string
  deadline: string
  subject: string
  order_type: string
  academic_level: string
  language: string
  min_pages: number
  max_pages: number
  price: number
  status: 'pending' | 'in_progress' | 'completed' | 'in_revision' | 'cancelled' | 'rejected'
  min_sources: number
  max_sources: number
  style: string
  paypal_order_id?: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  title: string
  content: string
  cover_image: string
  subject: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  title: string
  comment: string
  rating: number
  subject: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
}