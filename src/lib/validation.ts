// Validation utilities for form inputs

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long")
  }
  
  if (username.length > 30) {
    errors.push("Username must be less than 30 characters")
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}