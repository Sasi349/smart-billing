'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

interface Supplier {
  id: string
  supplierName: string
  businessName: string
  address: string
  gstin: string
  pan: string
  phone: string
  email: string
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    supplierName: '',
    businessName: '',
    address: '',
    gstin: '',
    pan: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Load suppliers from localStorage
    const savedSuppliers = localStorage.getItem('suppliers')
    if (savedSuppliers) {
      try {
        setSuppliers(JSON.parse(savedSuppliers))
      } catch (error) {
        console.error('Error loading suppliers:', error)
      }
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id)
    setFormData({
      supplierName: supplier.supplierName,
      businessName: supplier.businessName,
      address: supplier.address,
      gstin: supplier.gstin,
      pan: supplier.pan,
      phone: supplier.phone,
      email: supplier.email
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      supplierName: '',
      businessName: '',
      address: '',
      gstin: '',
      pan: '',
      phone: '',
      email: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.supplierName || !formData.businessName || !formData.address || !formData.gstin || !formData.pan || !formData.phone || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    if (editingId) {
      // Update existing supplier
      const updatedSuppliers = suppliers.map(supplier => 
        supplier.id === editingId 
          ? { ...supplier, ...formData }
          : supplier
      )
      setSuppliers(updatedSuppliers)
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers))
      alert('Supplier updated successfully!')
      setEditingId(null)
    } else {
      // Create new supplier
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData
      }

      // Save to localStorage
      const updatedSuppliers = [...suppliers, newSupplier]
      setSuppliers(updatedSuppliers)
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers))
      alert('Supplier added successfully!')
    }

    // Reset form
    setFormData({
      supplierName: '',
      businessName: '',
      address: '',
      gstin: '',
      pan: '',
      phone: '',
      email: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage suppliers and billing source details</p>
        </div>

        {/* Add/Edit Supplier Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                    required
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
                  <Label htmlFor="gstin">GSTIN *</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="Enter GSTIN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN *</Label>
                  <Input
                    id="pan"
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    placeholder="Enter PAN number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Supplier' : 'Add Supplier'}
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

        {/* Saved Suppliers List */}
        {suppliers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Suppliers ({suppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{supplier.supplierName}</h3>
                        <p className="text-sm text-gray-600">{supplier.businessName}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{supplier.address}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">GSTIN:</span> {supplier.gstin}</p>
                        <p><span className="font-medium">PAN:</span> {supplier.pan}</p>
                        <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                        <p><span className="font-medium">Email:</span> {supplier.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                        disabled={editingId === supplier.id}
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
