'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBgColor } from '@/lib/password-validation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''))
  const [showPasswordGuidance, setShowPasswordGuidance] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update password validation when password changes
    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
      setShowPasswordGuidance(value.length > 0)
    }
  }

  // Ensure password validation stays in sync with password field
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password)
      setPasswordValidation(validation)
      setShowPasswordGuidance(true)
    } else {
      setPasswordValidation(validatePassword(''))
      setShowPasswordGuidance(false)
    }
  }, [formData.password])

  const handleRegister = async () => {
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      setError('Please meet all password requirements')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 17v.01M12 14v.01M12 11v.01M9 8v.01M6 8v.01M15 8v.01"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-indigo-600">Smart Billing</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            
            {/* Password Strength Indicator */}
            {showPasswordGuidance && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Password Strength</span>
                  <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                    {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      passwordValidation.strength === 'weak' ? 'bg-red-600 w-1/4' : 
                      passwordValidation.strength === 'fair' ? 'bg-orange-600 w-1/2' : 
                      passwordValidation.strength === 'good' ? 'bg-yellow-600 w-3/4' : 
                      'bg-green-600 w-full'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {showPasswordGuidance && !passwordValidation.isValid && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.minLength ? '✓' : '○'}
                    </span>
                    <span className={passwordValidation.minLength ? 'text-green-700' : 'text-gray-600'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasUppercase ? '✓' : '○'}
                    </span>
                    <span className={passwordValidation.hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                      Uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasLowercase ? '✓' : '○'}
                    </span>
                    <span className={passwordValidation.hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                      Lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasNumber ? '✓' : '○'}
                    </span>
                    <span className={passwordValidation.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                      Number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.hasSpecialChar ? '✓' : '○'}
                    </span>
                    <span className={passwordValidation.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleRegister}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
