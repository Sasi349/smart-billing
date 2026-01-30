'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    // Dummy login - just set localStorage and redirect
    localStorage.setItem('isLoggedIn', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Smart Billing</h1>
          <p className="text-gray-600 mt-2">Professional Billing System</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
          >
            Login
          </Button>

          <div className="text-center pt-4 border-gray-200">
            <button
              onClick={() => {
                const whatsappNumber = '919994452406' // Replace with actual support number
                const message = encodeURIComponent('Hello, I would like to request assistance regarding the Smart Billing system.')
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            >
              Contact Us
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
