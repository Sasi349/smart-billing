'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Supplier {
  id: string
  supplierName: string
  businessName: string
  address: string
  gstin: string
  pan: string
  accountNumber: string
  ifscCode: string
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
  const { showToast, ToastContainer } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [isInvoiceNumberManuallyEdited, setIsInvoiceNumberManuallyEdited] = useState(false)

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  // Supplier form state
  const [supplierFormData, setSupplierFormData] = useState({
    supplierName: '',
    businessName: '',
    address: '',
    gstin: '',
    pan: '',
    accountNumber: '',
    ifscCode: '',
    phone: '',
    email: ''
  })

  // Customer form state
  const [customerFormData, setCustomerFormData] = useState({
    customerName: '',
    businessName: '',
    address: '',
    gstin: '',
    phone: '',
    email: ''
  })

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

  const generateDateBasedInvoiceNumber = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = String(Date.now()).slice(-4)
    return `INV-${year}-${month}${day}-${random}`
  }

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

    // Check if there's saved invoice data to restore (coming back from preview)
    const savedInvoiceData = localStorage.getItem('currentInvoice')
    if (savedInvoiceData) {
      try {
        const invoice = JSON.parse(savedInvoiceData)
        // Restore form data
        if (invoice.supplier) {
          setSelectedSupplier(invoice.supplier.id)
        }
        if (invoice.customer) {
          setSelectedCustomer(invoice.customer.id)
        }
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: invoice.invoiceNumber || '',
          invoiceDate: invoice.invoiceDate || new Date().toISOString().split('T')[0],
          placeOfSupply: invoice.placeOfSupply || '',
          items: invoice.items || [{
            particulars: '',
            hsnCode: '',
            quantity: 1,
            rate: 0,
            amount: 0
          }],
          cgstRate: invoice.cgstRate || 2.5,
          sgstRate: invoice.sgstRate || 2.5
        }))
      } catch (error) {
        console.error('Error restoring invoice data:', error)
      }
    }

    // Generate auto invoice number if not restored
    if (!localStorage.getItem('currentInvoice')) {
      const today = new Date()
      const invoiceNum = generateDateBasedInvoiceNumber(today.toISOString().split('T')[0])
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: invoiceNum
      }))
    }
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

  useEffect(() => {
    // Auto-regenerate invoice number when date changes (only if not manually edited)
    if (invoiceData.invoiceDate && !isInvoiceNumberManuallyEdited) {
      const newInvoiceNumber = generateDateBasedInvoiceNumber(invoiceData.invoiceDate)
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: newInvoiceNumber
      }))
    }
  }, [invoiceData.invoiceDate, isInvoiceNumberManuallyEdited])

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

  const handleClearInvoice = () => {
    // Clear current invoice data from localStorage
    localStorage.removeItem('currentInvoice')

    // Reset form to initial state with new date-based invoice number
    const today = new Date()
    const invoiceNum = generateDateBasedInvoiceNumber(today.toISOString().split('T')[0])

    setSelectedSupplier('')
    setSelectedCustomer('')
    setIsInvoiceNumberManuallyEdited(false)
    setInvoiceData({
      supplier: null,
      customer: null,
      invoiceNumber: invoiceNum,
      invoiceDate: today.toISOString().split('T')[0],
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
  }

  const handleSaveSupplier = () => {
    // Basic validation
    if (!supplierFormData.supplierName || !supplierFormData.businessName || !supplierFormData.address || !supplierFormData.gstin || !supplierFormData.pan || !supplierFormData.accountNumber || !supplierFormData.ifscCode) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    // Create new supplier
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      ...supplierFormData
    }

    // Save to localStorage
    const updatedSuppliers = [...suppliers, newSupplier]
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers))
    setSuppliers(updatedSuppliers)

    // Auto-select the new supplier
    setSelectedSupplier(newSupplier.id)
    setInvoiceData(prev => ({
      ...prev,
      supplier: newSupplier
    }))

    // Reset form and close modal
    setSupplierFormData({
      supplierName: '',
      businessName: '',
      address: '',
      gstin: '',
      pan: '',
      accountNumber: '',
      ifscCode: '',
      phone: '',
      email: ''
    })
    setShowSupplierModal(false)

    // Show success message
    showToast('Supplier added successfully!', 'success')
  }

  const handleSaveCustomer = () => {
    // Basic validation
    if (!customerFormData.customerName || !customerFormData.address) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    // Create new customer
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerFormData
    }

    // Save to localStorage
    const updatedCustomers = [...customers, newCustomer]
    localStorage.setItem('customers', JSON.stringify(updatedCustomers))
    setCustomers(updatedCustomers)

    // Auto-select the new customer
    setSelectedCustomer(newCustomer.id)
    setInvoiceData(prev => ({
      ...prev,
      customer: newCustomer
    }))

    // Reset form and close modal
    setCustomerFormData({
      customerName: '',
      businessName: '',
      address: '',
      gstin: '',
      phone: '',
      email: ''
    })
    setShowCustomerModal(false)

    // Show success message
    showToast('Customer added successfully!', 'success')
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

    // Save to localStorage for invoice preview
    localStorage.setItem('currentInvoice', JSON.stringify(completeInvoiceData))

    // Navigate to preview invoice page
    router.push('/preview-invoice')
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
      <ToastContainer />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 pt-20">
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle className="text-base sm:text-lg">Supplier Details</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowSupplierModal(true)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Supplier
              </Button>
            </div>
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
                  <p className="text-sm text-gray-600">Account Number: {invoiceData.supplier.accountNumber}</p>
                  <p className="text-sm text-gray-600">IFSC Code: {invoiceData.supplier.ifscCode}</p>
                  <p className="text-sm text-gray-600">PAN: {invoiceData.supplier.pan}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle className="text-base sm:text-lg">Customer Details</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowCustomerModal(true)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Customer
              </Button>
            </div>
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
                  onChange={(e) => {
                    setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))
                    setIsInvoiceNumberManuallyEdited(true)
                  }}
                  placeholder="Enter invoice number"
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
                        type="text"
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow numbers with optional decimal point (max one decimal place)
                          const regex = /^\d*\.?\d{0,3}$/

                          if (value === '' || regex.test(value)) {
                            // Store the string value temporarily to allow typing decimals
                            handleItemChange(index, 'quantity', value)
                          }
                        }}
                        onBlur={() => {
                          // Convert to number on blur for calculations, but store as string
                          const numValue = typeof item?.quantity === 'string' ? parseFloat(item.quantity) || 0 : item?.quantity || 0
                          handleItemChange(index, 'quantity', numValue.toString())
                        }}
                        onWheel={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault()
                          }
                        }}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate *</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={item.rate}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow numbers with optional decimal point (max one decimal place)
                          const regex = /^\d*\.?\d{0,3}$/

                          if (value === '' || regex.test(value)) {
                            // Store the string value to allow typing decimals
                            handleItemChange(index, 'rate', value)
                          }
                        }}
                        onBlur={() => {
                          // Convert to number on blur for calculations, but store as string
                          const numValue = typeof item?.rate === 'string' ? parseFloat(item.rate) || 0 : item?.rate || 0
                          handleItemChange(index, 'rate', numValue.toString())
                        }}
                        onWheel={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault()
                          }
                        }}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 mb-8">
          <Button
            onClick={handleClearInvoice}
            variant="outline"
            className="w-full sm:flex-1 h-11 text-base font-medium"
          >
            New Invoice
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            className="w-full sm:flex-1 h-11 text-base font-medium"
          >
            Generate Invoice
          </Button>
        </div>
      </main>

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Supplier</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSupplierModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    value={supplierFormData.supplierName}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={supplierFormData.businessName}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter business name"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <textarea
                    id="address"
                    value={supplierFormData.address}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN *</Label>
                  <Input
                    id="gstin"
                    value={supplierFormData.gstin}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="Enter GSTIN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN *</Label>
                  <Input
                    id="pan"
                    value={supplierFormData.pan}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, pan: e.target.value }))}
                    placeholder="Enter PAN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={supplierFormData.accountNumber}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="Enter bank account number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <Input
                    id="ifscCode"
                    value={supplierFormData.ifscCode}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                    placeholder="Enter IFSC code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={supplierFormData.email}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSupplierModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSupplier}>
                Save Supplier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerFormData.customerName}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={customerFormData.businessName}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter business name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <textarea
                    id="address"
                    value={customerFormData.address}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={customerFormData.gstin}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="Enter GSTIN number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCustomerModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCustomer}>
                Save Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
