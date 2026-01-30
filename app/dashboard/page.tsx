'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, ArrowRight, LayoutTemplate, Building } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])

  const handleCustomersClick = () => {
    router.push('/customers')
  }

  const handleBillingClick = () => {
    router.push('/billing')
  }

  const handleBillingTemplatesClick = () => {
    router.push('/billing-template')
  }

  const handleSuppliersClick = () => {
    router.push('/suppliers')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome to Smart Billing System</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Suppliers Card */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-indigo-500 group h-48"
            onClick={handleSuppliersClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Suppliers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Manage suppliers and billing source details
              </p>
              <div className="flex items-center text-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>Manage suppliers</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-indigo-500 group h-48"
            onClick={handleCustomersClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Customers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Manage your customer database and view customer information
              </p>
              <div className="flex items-center text-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>Manage customers</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Billing Card */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-indigo-500 group h-48"
            onClick={handleBillingClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Billing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Create and manage invoices, track payments and billing history
              </p>
              <div className="flex items-center text-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>Create invoice</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Billing Templates Card */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-indigo-500 group h-48"
            onClick={handleBillingTemplatesClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Create and preview professional tax invoice formats
              </p>
              <div className="flex items-center text-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span>View templates</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
