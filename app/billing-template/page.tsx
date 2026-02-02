'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer, ArrowLeft, Mail, MessageCircle } from 'lucide-react'

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

// Default dummy data (fallback)
const defaultBusinessDetails = {
  name: "TECH SOLUTIONS PRIVATE LIMITED",
  address: "123, Tech Park, Sector 15,\nGurugram, Haryana - 122001",
  gstin: "06AAHCT1234C1ZV",
  phone: "+91 98765 43210",
  email: "billing@techsolutions.com",
  pan: "AAHCT1234C",
  accountNumber: "1234567890123456",
  ifscCode: "HDFC0001234",
  accountName: "TECH SOLUTIONS PRIVATE LIMITED"
}

const defaultCustomerDetails = {
  name: "ABC Enterprises",
  address: "456, Business Hub, Sector 8,\nDelhi - 110001",
  gstin: "07AAHPC5678B2ZY"
}

const defaultInvoiceDetails = {
  placeOfSupply: "Haryana",
  invoiceNumber: "TS-2024-001",
  invoiceDate: "29/01/2026"
}

const defaultInvoiceItems = [
  {
    sno: 1,
    particulars: "Software Development Services",
    hsnCode: "9983",
    quantity: 4,
    unit: "UNIT",
    rate: 25000,
    amount: 100000
  },
  {
    sno: 2,
    particulars: "Technical Support & Maintenance",
    hsnCode: "9983",
    quantity: 12,
    unit: "MONTH",
    rate: 5000,
    amount: 60000
  }
]

const defaultTaxDetails = {
  taxableValue: 160000.45,
  cgstRate: 2.5,
  sgstRate: 2.5,
  cgstAmount: 4000.01,
  sgstAmount: 4000.01,
  total: 168000.47,
  amountInWords: "Rupees One Lakh Sixty Eight Thousand and Forty-Seven Paise Only"
}

export default function BillingTemplatePage() {
  const router = useRouter()
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [useDefaultData, setUseDefaultData] = useState(true)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false)

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

        // Try to load invoice data from localStorage
        const savedInvoiceData = localStorage.getItem('currentInvoice')
        if (savedInvoiceData) {
          try {
            const parsed = JSON.parse(savedInvoiceData)
            setInvoiceData(parsed)
            setUseDefaultData(false)
          } catch (error) {
            console.error('Error loading invoice data:', error)
            setUseDefaultData(true)
          }
        } else {
          setUseDefaultData(true)
        }
      } catch (error) {
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handlePrint = async () => {
    // Download PDF directly instead of opening print dialog
    if (!useDefaultData && invoiceData) {
      await downloadInvoicePDF(invoiceData)
    } else {
      // For default data, show message
      alert('Please generate an invoice first to download the PDF')
    }
    
    // Send email in background (non-blocking)
    if (!useDefaultData && invoiceData) {
      sendInvoiceEmailInBackground(invoiceData)
    }
  }

  const downloadInvoicePDF = async (invoice: InvoiceData) => {
    try {
      console.log('Starting PDF download for invoice:', invoice.invoiceNumber)
      
      // Generate PDF using the dedicated PDF generation endpoint
      const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invoice/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie
        },
        body: JSON.stringify({ invoiceData: invoice })
      })

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json()
        console.error('PDF generation failed:', errorData.error)
        alert('Failed to generate PDF: ' + errorData.error)
        return
      }

      // Get PDF as blob
      const pdfBlob = await pdfResponse.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoice.invoiceNumber}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      console.log(`PDF downloaded successfully: invoice-${invoice.invoiceNumber}.pdf`)
      
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const sendInvoiceEmailInBackground = async (invoice: InvoiceData) => {
    try {
      console.log('Starting background email send for invoice:', invoice.invoiceNumber)
      
      // Get current user email
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (!userResponse.ok) {
        console.error('Failed to get user information for background email')
        setEmailStatus('error')
        return
      }
      
      const userData = await userResponse.json()
      const userEmail = userData.user.email

      // Send invoice email in background
      const emailResponse = await fetch('/api/invoice/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          invoiceData: {
            supplier: {
              businessName: invoice.supplier.businessName,
              address: invoice.supplier.address,
              gstin: invoice.supplier.gstin,
              phone: invoice.supplier.phone,
              email: invoice.supplier.email,
              pan: invoice.supplier.pan,
              accountNumber: invoice.supplier.accountNumber,
              ifscCode: invoice.supplier.ifscCode,
              accountName: invoice.supplier.accountName
            },
            customer: {
              customerName: invoice.customer.customerName,
              businessName: invoice.customer.businessName,
              address: invoice.customer.address,
              gstin: invoice.customer.gstin
            },
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            placeOfSupply: invoice.placeOfSupply,
            items: invoice.items,
            cgstRate: invoice.cgstRate,
            sgstRate: invoice.sgstRate,
            taxableValue: invoice.taxableValue,
            cgstAmount: invoice.cgstAmount,
            sgstAmount: invoice.sgstAmount,
            total: invoice.total,
            amountInWords: invoice.amountInWords
          },
          userEmail
        })
      })

      const emailData = await emailResponse.json()
      
      if (emailResponse.ok) {
        console.log(`Invoice ${invoice.invoiceNumber} sent in background to: ${userEmail}`)
        setEmailStatus('sent')
        // Reset status after 3 seconds
        setTimeout(() => setEmailStatus('idle'), 3000)
      } else {
        console.error('Background email sending failed:', emailData.error)
        setEmailStatus('error')
        // Reset status after 3 seconds
        setTimeout(() => setEmailStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error in background email sending:', error)
      setEmailStatus('error')
      // Reset status after 3 seconds
      setTimeout(() => setEmailStatus('idle'), 3000)
    }
  }

  const handleShareViaWhatsApp = () => {
    setIsWhatsAppDialogOpen(true)
  }

  const handleWhatsAppWithPhoneNumber = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a valid phone number')
      return
    }

    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '')
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
    setIsWhatsAppDialogOpen(false)
    setPhoneNumber('')
  }

  const handleWhatsAppChooseContacts = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
    setIsWhatsAppDialogOpen(false)
  }

  const generateWhatsAppMessage = () => {
    if (!invoiceData || useDefaultData) {
      return 'Check out this invoice from Smart Billing System'
    }

    return `📄 *Invoice ${invoiceData.invoiceNumber}*

🏢 *From:* ${invoiceData.supplier.businessName}
📧 *Email:* ${invoiceData.supplier.email}
📞 *Phone:* ${invoiceData.supplier.phone}

👤 *Bill To:* ${invoiceData.customer.customerName}
🏢 *Business:* ${invoiceData.customer.businessName}

💰 *Total Amount:* ₹${invoiceData.total.toLocaleString('en-IN')}
📝 *Amount in Words:* ${invoiceData.amountInWords}

📅 *Date:* ${invoiceData.invoiceDate}
📍 *Place of Supply:* ${invoiceData.placeOfSupply}

Generated via Smart Billing System`
  }

  // Get data based on whether we have real data or need to use defaults
  const getBusinessDetails = () => {
    if (!useDefaultData && invoiceData?.supplier) {
      return {
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
    }
    return defaultBusinessDetails
  }

  const getCustomerDetails = () => {
    if (!useDefaultData && invoiceData?.customer) {
      return {
        name: invoiceData.customer.customerName,
        businessName: invoiceData.customer.businessName,
        address: invoiceData.customer.address,
        gstin: invoiceData.customer.gstin
      }
    }
    return {
      name: defaultCustomerDetails.name,
      businessName: defaultCustomerDetails.name,
      address: defaultCustomerDetails.address,
      gstin: defaultCustomerDetails.gstin
    }
  }

  const getInvoiceDetails = () => {
    if (!useDefaultData && invoiceData) {
      return {
        placeOfSupply: invoiceData.placeOfSupply,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate
      }
    }
    return defaultInvoiceDetails
  }

  const getInvoiceItems = () => {
    if (!useDefaultData && invoiceData?.items) {
      return invoiceData.items.map((item, index) => ({
        sno: index + 1,
        particulars: item.particulars,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unit: "UNIT",
        rate: item.rate,
        amount: item.amount
      }))
    }
    return defaultInvoiceItems
  }

  const getTaxDetails = () => {
    if (!useDefaultData && invoiceData) {
      return {
        taxableValue: invoiceData.taxableValue,
        cgstRate: invoiceData.cgstRate,
        sgstRate: invoiceData.sgstRate,
        cgstAmount: invoiceData.cgstAmount,
        sgstAmount: invoiceData.sgstAmount,
        total: invoiceData.total,
        amountInWords: invoiceData.amountInWords
      }
    }
    return defaultTaxDetails
  }

  const businessDetails = getBusinessDetails()
  const customerDetails = getCustomerDetails()
  const invoiceDetails = getInvoiceDetails()
  const invoiceItems = getInvoiceItems()
  const taxDetails = getTaxDetails()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-20">
        {/* Back and Action Buttons */}
        <div className="mb-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="print:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleShareViaWhatsApp} className="print:hidden hidden">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share via WhatsApp</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Enter Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include country code (e.g., +91 for India)
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleWhatsAppWithPhoneNumber}
                      className="w-full"
                      disabled={!phoneNumber.trim()}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send to This Number
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleWhatsAppChooseContacts}
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Choose Contacts
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handlePrint} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>

        {/* Background Email Status Indicator */}
        {emailStatus !== 'idle' && (
          <div className="mb-4">
            <div className={`p-3 rounded-lg border flex items-center gap-2 print:hidden ${
              emailStatus === 'sending' 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : emailStatus === 'sent'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {emailStatus === 'sending' ? (
                <>
                  <Mail className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">
                    Sending invoice to your email...
                  </span>
                </>
              ) : emailStatus === 'sent' ? (
                <>
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Invoice sent to your email successfully
                  </span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Failed to send invoice email
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-8 print:shadow-none print:border-none">
          
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border border-gray-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-left font-medium text-gray-900">S.No</th>
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-left font-medium text-gray-900">Particulars</th>
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-center font-medium text-gray-900">HSN Code</th>
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-center font-medium text-gray-900">Qty</th>
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-right font-medium text-gray-900">Rate</th>
                    <th className="border border-gray-300 px-1 sm:px-2 py-2 text-right font-medium text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item) => (
                    <tr key={item.sno}>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-gray-700">{item.sno}</td>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-gray-700">{item.particulars}</td>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-center text-gray-700">{item.hsnCode}</td>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-center text-gray-700">{item.quantity} {item.unit}</td>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-right text-gray-700">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="border border-gray-300 px-1 sm:px-2 py-2 text-right text-gray-700">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Account Number: <span className="font-semibold text-gray-900">{businessDetails.accountNumber}</span></p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">IFSC Code: <span className="font-semibold text-gray-900">{businessDetails.ifscCode}</span></p>
              {businessDetails.accountName && (
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Account Name: <span className="font-semibold text-gray-900">{businessDetails.accountName}</span></p>
              )}
              <p className="text-xs sm:text-sm text-gray-600 mb-2">PAN: <span className="font-semibold text-gray-900">{businessDetails.pan}</span></p>
              <p className="text-xs sm:text-sm text-gray-600">This is a computer-generated invoice and does not require signature.</p>
            </div>
            <div className="text-right">
              <div className="inline-block mt-8 pt-4">
                <p className="text-sm sm:text-base font-medium text-gray-900">{businessDetails.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
