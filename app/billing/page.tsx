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

interface Customer {
  id: string
  customerName: string
  businessName: string
  address: string
  gstin: string
  phone: string
  email: string
}

interface InvoiceItem {
  particulars: string
  hsnCode: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceData {
  supplier: Supplier | null
  customer: Customer | null
  invoiceNumber: string
  invoiceDate: string
  placeOfSupply: string
  items: InvoiceItem[]
  cgstRate: number
  sgstRate: number
}

export default function BillingPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    supplier: null,
    customer: null,
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    placeOfSupply: '',
    items: [
      {
        particulars: '',
        hsnCode: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    cgstRate: 2.5,
    sgstRate: 2.5
  })

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Load suppliers and customers from localStorage
    const savedSuppliers = localStorage.getItem('suppliers')
    const savedCustomers = localStorage.getItem('customers')
    
    if (savedSuppliers) {
      try {
        setSuppliers(JSON.parse(savedSuppliers))
      } catch (error) {
        console.error('Error loading suppliers:', error)
      }
    }
    
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers))
      } catch (error) {
        console.error('Error loading customers:', error)
      }
    }

    // Generate auto invoice number
    const today = new Date()
    const invoiceNum = `INV-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: invoiceNum
    }))
  }, [router])

  useEffect(() => {
    // Auto-fill supplier details when selected
    if (selectedSupplier) {
      const supplier = suppliers.find(s => s.id === selectedSupplier)
      if (supplier) {
        setInvoiceData(prev => ({
          ...prev,
          supplier
        }))
      }
    }
  }, [selectedSupplier, suppliers])

  useEffect(() => {
    // Auto-fill customer details when selected
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === selectedCustomer)
      if (customer) {
        setInvoiceData(prev => ({
          ...prev,
          customer
        }))
      }
    }
  }, [selectedCustomer, customers])

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate
    }
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }))
  }

  const addNewItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          particulars: '',
          hsnCode: '',
          quantity: 1,
          rate: 0,
          amount: 0
        }
      ]
    }))
  }

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter((_, i) => i !== index)
      setInvoiceData(prev => ({
        ...prev,
        items: updatedItems
      }))
    }
  }

  const calculateTotals = () => {
    const taxableValue = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    const cgstAmount = taxableValue * (invoiceData.cgstRate / 100)
    const sgstAmount = taxableValue * (invoiceData.sgstRate / 100)
    const total = taxableValue + cgstAmount + sgstAmount
    
    return {
      taxableValue,
      cgstAmount,
      sgstAmount,
      total
    }
  }

  const handleGenerateInvoice = () => {
    // Validation
    if (!invoiceData.supplier || !invoiceData.customer) {
      alert('Please select both supplier and customer')
      return
    }
    
    if (!invoiceData.placeOfSupply) {
      alert('Please enter place of supply')
      return
    }
    
    const validItems = invoiceData.items.filter(item => item.particulars && item.quantity > 0 && item.rate > 0)
    if (validItems.length === 0) {
      alert('Please add at least one valid item with all details')
      return
    }

    // Prepare complete invoice data
    const totals = calculateTotals()
    const completeInvoiceData = {
      ...invoiceData,
      items: validItems,
      ...totals,
      amountInWords: convertNumberToWords(totals.total)
    }

    // Save to localStorage for invoice template
    localStorage.setItem('currentInvoice', JSON.stringify(completeInvoiceData))
    
    // Navigate to invoice template
    router.push('/billing-template')
  }

  const convertNumberToWords = (amount: number): string => {
    const convertToWords = (num: number): string => {
      if (num === 0) return 'Zero'
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      const thousands = ['', 'Thousand', 'Lakh', 'Crore']
      
      let result = ''
      let crore = Math.floor(num / 10000000)
      let lakh = Math.floor((num % 10000000) / 100000)
      let thousand = Math.floor((num % 100000) / 1000)
      let hundred = Math.floor((num % 1000) / 100)
      let remainder = num % 100
      
      if (crore > 0) {
        result += convertToWords(crore) + ' Crore '
      }
      
      if (lakh > 0) {
        result += convertToWords(lakh) + ' Lakh '
      }
      
      if (thousand > 0) {
        result += convertToWords(thousand) + ' Thousand '
      }
      
      if (hundred > 0) {
        result += convertToWords(hundred) + ' Hundred '
      }
      
      if (remainder > 0) {
        if (remainder < 10) {
          result += ones[remainder]
        } else if (remainder < 20) {
          result += teens[remainder - 10]
        } else {
          result += tens[Math.floor(remainder / 10)]
          if (remainder % 10 > 0) {
            result += ' ' + ones[remainder % 10]
          }
        }
      }
      
      return result.trim()
    }
    
    const rupees = Math.floor(amount)
    const paise = Math.round((amount - rupees) * 100)
    
    let words = 'Rupees ' + convertToWords(rupees)
    
    if (paise > 0) {
      const paiseWords = convertToWords(paise)
      words += ' and ' + paiseWords + ' Paise'
    }
    
    words += ' Only'
    
    return words
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
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
      <main className="max-w-6xl mx-auto px-4 pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Generate professional tax invoices</p>
        </div>

        {/* Supplier Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Select Supplier *</Label>
                <select
                  id="supplier"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a supplier...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName} - {supplier.businessName}
                    </option>
                  ))}
                </select>
              </div>
              
              {invoiceData.supplier && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{invoiceData.supplier.businessName}</h4>
                  <p className="text-sm text-gray-600">{invoiceData.supplier.address}</p>
                  <p className="text-sm text-gray-600">GSTIN: {invoiceData.supplier.gstin}</p>
                  <p className="text-sm text-gray-600">PAN: {invoiceData.supplier.pan}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer *</Label>
                <select
                  id="customer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerName} - {customer.businessName}
                    </option>
                  ))}
                </select>
              </div>
              
              {invoiceData.customer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{invoiceData.customer.customerName}</h4>
                  <p className="text-sm text-gray-600">{invoiceData.customer.businessName}</p>
                  <p className="text-sm text-gray-600">{invoiceData.customer.address}</p>
                  <p className="text-sm text-gray-600">GSTIN: {invoiceData.customer.gstin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceData.invoiceDate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeOfSupply">Place of Supply *</Label>
                <Input
                  id="placeOfSupply"
                  value={invoiceData.placeOfSupply}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, placeOfSupply: e.target.value }))}
                  placeholder="e.g., Haryana"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoiceData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Particulars *</Label>
                      <Input
                        value={item.particulars}
                        onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>HSN Code</Label>
                      <Input
                        value={item.hsnCode}
                        onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                        placeholder="HSN code (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        value={`₹${item.amount.toLocaleString('en-IN')}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  {invoiceData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="mt-2"
                    >
                      Remove Item
                    </Button>
                  )}
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addNewItem}>
                Add Another Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tax Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                <Input
                  id="cgstRate"
                  type="number"
                  step="0.1"
                  value={invoiceData.cgstRate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, cgstRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                <Input
                  id="sgstRate"
                  type="number"
                  step="0.1"
                  value={invoiceData.sgstRate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, sgstRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-medium">₹{calculateTotals().taxableValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({invoiceData.cgstRate}%):</span>
                <span className="font-medium">₹{calculateTotals().cgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({invoiceData.sgstRate}%):</span>
                <span className="font-medium">₹{calculateTotals().sgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{calculateTotals().total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Invoice Button */}
        <Button onClick={handleGenerateInvoice} className="w-full" size="lg">
          Generate Invoice
        </Button>
      </main>
    </div>
  )
}
