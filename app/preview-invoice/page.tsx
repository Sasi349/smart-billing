'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Printer } from 'lucide-react'

// Invoice data interfaces
interface Supplier {
  id: string
  supplierName: string
  businessName: string
  address: string
  gstin: string
  pan: string
  accountNumber: string
  ifscCode: string
  accountName?: string
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
  supplier: Supplier
  customer: Customer
  invoiceNumber: string
  invoiceDate: string
  placeOfSupply: string
  items: InvoiceItem[]
  cgstRate: number
  sgstRate: number
  taxableValue: number
  cgstAmount: number
  sgstAmount: number
  total: number
  amountInWords: string
}

export default function PreviewInvoicePage() {
  const router = useRouter()
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)

  useEffect(() => {
    // Check if user is authenticated by testing API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          router.push('/login')
          return
        }

        // Load invoice data from localStorage
        const savedInvoice = localStorage.getItem('currentInvoice')
        if (savedInvoice) {
          try {
            const parsedInvoice = JSON.parse(savedInvoice)
            setInvoiceData(parsedInvoice)
          } catch (error) {
            console.error('Error loading invoice data:', error)
            router.push('/billing')
          }
        } else {
          // No invoice data, redirect to billing
          router.push('/billing')
        }
      } catch (error) {
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handleEditInvoice = () => {
    // Navigate back to billing page - data is already in localStorage
    router.push('/billing')
  }

  const handlePrintInvoice = () => {
    // Navigate to billing template for printing
    router.push('/billing-template')
  }

  const calculateTotals = () => {
    if (!invoiceData) return { taxableValue: 0, cgstAmount: 0, sgstAmount: 0, total: 0 }
    
    return {
      taxableValue: invoiceData.taxableValue,
      cgstAmount: invoiceData.cgstAmount,
      sgstAmount: invoiceData.sgstAmount,
      total: invoiceData.total
    }
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  // Prepare data in the same format as billing-template
  const businessDetails = {
    name: invoiceData.supplier.businessName,
    address: invoiceData.supplier.address,
    gstin: invoiceData.supplier.gstin,
    phone: invoiceData.supplier.phone,
    email: invoiceData.supplier.email,
    pan: invoiceData.supplier.pan,
    accountNumber: invoiceData.supplier.accountNumber,
    ifscCode: invoiceData.supplier.ifscCode,
    accountName: invoiceData.supplier.accountName
  }

  const customerDetails = {
    name: invoiceData.customer.customerName,
    businessName: invoiceData.customer.businessName,
    address: invoiceData.customer.address,
    gstin: invoiceData.customer.gstin
  }

  const invoiceDetails = {
    placeOfSupply: invoiceData.placeOfSupply,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDate: invoiceData.invoiceDate
  }

  const invoiceItems = invoiceData.items.map((item, index) => ({
    sno: index + 1,
    particulars: item.particulars,
    hsnCode: item.hsnCode,
    quantity: item.quantity,
    unit: 'UNIT',
    rate: item.rate,
    amount: item.amount
  }))

  const taxDetails = {
    taxableValue: invoiceData.taxableValue,
    cgstRate: invoiceData.cgstRate,
    sgstRate: invoiceData.sgstRate,
    cgstAmount: invoiceData.cgstAmount,
    sgstAmount: invoiceData.sgstAmount,
    total: invoiceData.total,
    amountInWords: invoiceData.amountInWords
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Action Buttons */}
      {/* Top-left Back button - visible on all screens */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-20 mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/billing')}
          className="print:hidden"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Desktop action buttons - hidden on mobile */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 mb-4 hidden sm:block">
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleEditInvoice}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Button
            onClick={handlePrintInvoice}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 pb-8">
        <div className="bg-white shadow-sm border border-gray-200 p-3 sm:p-6 lg:p-8 print:shadow-none print:border-none print:p-8">
          
          {/* Header Section */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">TAX INVOICE</h1>
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{businessDetails.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{businessDetails.address}</p>
              <p className="text-xs sm:text-sm text-gray-600">GSTIN: {businessDetails.gstin}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                <p className="text-xs sm:text-sm text-gray-600">Email: {businessDetails.email}</p>
                <p className="text-xs sm:text-sm text-gray-600">Phone: {businessDetails.phone}</p>
              </div>
            </div>
          </div>

          {/* Buyer & Invoice Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
            {/* Bill To Section */}
            <div className="border border-gray-300 p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Bill To</h3>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">{customerDetails.name}</p>
              <p className="text-xs sm:text-sm text-gray-600">{customerDetails.businessName}</p>
              <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{customerDetails.address}</p>
              <p className="text-xs sm:text-sm text-gray-600">GSTIN: {customerDetails.gstin}</p>
            </div>

            {/* Invoice Details Section */}
            <div className="border border-gray-300 p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Invoice Details</h3>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Place of Supply:</span> {invoiceDetails.placeOfSupply}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Invoice No:</span> {invoiceDetails.invoiceNumber}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Invoice Date:</span> {invoiceDetails.invoiceDate}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 sm:mb-6">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-[600px] px-3 sm:px-0">
                <table className="w-full border border-gray-300 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-900 whitespace-nowrap">S.No</th>
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-900">Particulars</th>
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center font-medium text-gray-900 whitespace-nowrap">HSN Code</th>
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center font-medium text-gray-900 whitespace-nowrap">Qty</th>
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap">Rate</th>
                      <th className="border border-gray-300 px-2 sm:px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => (
                      <tr key={item.sno}>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-700 whitespace-nowrap">{item.sno}</td>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-700 break-words">{item.particulars}</td>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-gray-700 whitespace-nowrap">{item.hsnCode}</td>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-gray-700 whitespace-nowrap">{item.quantity} {item.unit}</td>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-right text-gray-700 whitespace-nowrap">₹{item.rate.toLocaleString('en-IN')}</td>
                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-right text-gray-700 whitespace-nowrap">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tax Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
            <div></div>
            <div className="border border-gray-300 p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Taxable Value:</span>
                  <span className="text-gray-900">₹{taxDetails.taxableValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">CGST ({taxDetails.cgstRate}%):</span>
                  <span className="text-gray-900">₹{taxDetails.cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">SGST ({taxDetails.sgstRate}%):</span>
                  <span className="text-gray-900">₹{taxDetails.sgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-sm sm:text-base">
                    <span className="text-gray-900">TOTAL:</span>
                    <span className="text-gray-900">₹{taxDetails.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Amount in Words:</span> {taxDetails.amountInWords}
            </p>
          </div>

          {/* Footer Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Account Number: <span className="font-semibold text-gray-900">{businessDetails.accountNumber}</span></p>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">IFSC Code: <span className="font-semibold text-gray-900">{businessDetails.ifscCode}</span></p>
              {businessDetails.accountName && (
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Account Name: <span className="font-semibold text-gray-900">{businessDetails.accountName}</span></p>
              )}
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">PAN: <span className="font-semibold text-gray-900">{businessDetails.pan}</span></p>
              <p className="text-xs sm:text-sm text-gray-600">This is a computer-generated invoice and does not require signature.</p>
            </div>
            <div className="text-right">
              <div className="inline-block">
                <p className="text-sm sm:text-base font-medium text-gray-900">{businessDetails.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden print:hidden z-40">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button
            onClick={handleEditInvoice}
            variant="outline"
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Invoice
          </Button>
          <Button
            onClick={handlePrintInvoice}
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </div>
  )
}
