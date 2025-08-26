import axios from 'axios'
import { User, Order } from '@/types'
import { API_BASE_URL } from '@/lib/config'

// Create Axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
            refresh: refreshToken
          })
          
          localStorage.setItem('access_token', refreshResponse.data.access)
          // Only update refresh token if provided (Django JWT usually doesn&apos;t rotate refresh tokens)
          if (refreshResponse.data.refresh) {
            localStorage.setItem('refresh_token', refreshResponse.data.refresh)
          }
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.access}`
          return axios(error.config)
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('auth/login/', { username, password })
    localStorage.setItem('access_token', response.data.access)
    localStorage.setItem('refresh_token', response.data.refresh)
    return response
  },

  register: async (username: string, email: string, password: string) => {
    return api.post('auth/register/', { username, email, password })
  },

  verifyEmail: async (email: string, otp: string) => {
    return api.post('auth/verify-email/', { email, otp })
  },

  resendOTP: async (email: string) => {
    return api.post('auth/resend-otp/', { email })
  },

  requestPasswordReset: async (email: string) => {
    return api.post('auth/request-password-reset/', { email })
  },

  verifyPasswordResetOTP: async (email: string, otp: string, resetToken: string) => {
    return api.post('auth/verify-password-reset-otp/', { email, otp, reset_token: resetToken })
  },

  resetPassword: async (email: string, otp: string, newPassword: string, resetToken: string) => {
    return api.post('auth/reset-password/', { 
      email, 
      otp, 
      new_password: newPassword, 
      reset_token: resetToken 
    })
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await api.post('auth/logout/', { refresh: refreshToken })
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('users/me/')
    return response.data
  }
}

// Orders API
export const ordersAPI = {
  create: async (orderData: Partial<Order>) => {
    return api.post('orders/', orderData)
  },

  getAll: async () => {
    return api.get('orders/')
  },

  getById: async (id: string) => {
    return api.get(`orders/${id}/`)
  },

  capturePayment: async (paypalOrderId: string) => {
    return api.post(`orders/${paypalOrderId}/capture_payment/`)
  }
}

// Generic API functions for other endpoints
export const genericAPI = {
  getSubjects: () => api.get('subjects/'),
  getAcademicLevels: () => api.get('academic-levels/'),
  getOrderTypes: () => api.get('order-types/'),
  getFormattingStyles: () => api.get('formatting-styles/'),
  getLanguages: () => api.get('languages/'),
  getServices: () => api.get('services/'),
  getBlogs: () => api.get('blogs/'),
  getReviews: () => api.get('reviews/'),
}