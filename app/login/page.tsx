'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full shadow-lg border-0 bg-white/95 pt-2 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4 pt-2">
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
          <h1 className="text-4xl font-bold text-indigo-600 tracking-tight">Smart Billing</h1>
          <p className="text-gray-600 mt-3 text-lg leading-relaxed">Professional Billing System</p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-11 px-4 text-base rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-11 text-base rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            className="w-full h-11 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 rounded"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => {
                const whatsappNumber = '919994452406' // Replace with actual support number
                const message = encodeURIComponent('Hello, I would like to request assistance regarding the Smart Billing system.')
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-all duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 rounded"
            >
              Contact Us
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
