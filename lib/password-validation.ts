export interface PasswordValidation {
  isValid: boolean
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  strength: 'weak' | 'fair' | 'good' | 'strong'
}

export function validatePassword(password: string): PasswordValidation {
  const minLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const passedRules = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length

  let strength: PasswordValidation['strength'] = 'weak'
  if (passedRules === 5) strength = 'strong'
  else if (passedRules >= 3) strength = 'good'
  else if (passedRules >= 2) strength = 'fair'

  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    strength
  }
}

export function getPasswordStrengthColor(strength: PasswordValidation['strength']): string {
  switch (strength) {
    case 'weak': return 'text-red-600'
    case 'fair': return 'text-orange-600'
    case 'good': return 'text-yellow-600'
    case 'strong': return 'text-green-600'
    default: return 'text-gray-600'
  }
}

export function getPasswordStrengthBgColor(strength: PasswordValidation['strength']): string {
  switch (strength) {
    case 'weak': return 'bg-red-600'
    case 'fair': return 'bg-orange-600'
    case 'good': return 'bg-yellow-600'
    case 'strong': return 'bg-green-600'
    default: return 'bg-gray-300'
  }
}
