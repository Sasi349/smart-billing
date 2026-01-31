'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Customer {
  _id: string
  customerName: string
  businessName: string
  address: string
  gstin: string
  phone: string
  email: string
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    businessName: '',
    address: '',
    gstin: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingId(customer._id)
    setFormData({
      customerName: customer.customerName,
      businessName: customer.businessName,
      address: customer.address,
      gstin: customer.gstin,
      phone: customer.phone,
      email: customer.email
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      customerName: '',
      businessName: '',
      address: '',
      gstin: '',
      phone: '',
      email: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.address) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      const url = editingId ? `/api/customers/${editingId}` : '/api/customers'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast(`Customer ${editingId ? 'updated' : 'added'} successfully!`, 'success')
        setEditingId(null)
        setFormData({
          customerName: '',
          businessName: '',
          address: '',
          gstin: '',
          phone: '',
          email: ''
        })
        loadCustomers()
      } else {
        const data = await response.json()
        showToast(data.error || 'Operation failed', 'error')
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ToastContainer />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-20">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database and billing information</p>
        </div>

        {/* Add/Edit Customer Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="Enter GSTIN number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Customer' : 'Add Customer'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Saved Customers List */}
        {customers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Customers ({customers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                        <p className="text-sm text-gray-600">{customer.businessName}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{customer.address}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">GSTIN:</span> {customer.gstin}</p>
                        <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                        <p><span className="font-medium">Email:</span> {customer.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(customer)}
                        disabled={editingId === customer._id}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
