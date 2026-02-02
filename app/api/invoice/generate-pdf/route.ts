import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

interface InvoiceData {
  supplier: {
    businessName: string
    address: string
    gstin: string
    phone: string
    email: string
    pan: string
    accountNumber: string
    ifscCode: string
    accountName?: string
  }
  customer: {
    customerName: string
    businessName: string
    address: string
    gstin: string
  }
  invoiceNumber: string
  invoiceDate: string
  placeOfSupply: string
  items: Array<{
    particulars: string
    hsnCode: string
    quantity: number
    rate: number
    amount: number
  }>
  cgstRate: number
  sgstRate: number
  taxableValue: number
  cgstAmount: number
  sgstAmount: number
  total: number
  amountInWords: string
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { invoiceData } = body

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Invoice data is required' },
        { status: 400 }
      )
    }

    // Dynamic import of puppeteer to prevent client-side bundling
    let puppeteer: any
    try {
      puppeteer = await import('puppeteer')
    } catch (error) {
      console.error('Failed to import puppeteer:', error)
      return NextResponse.json(
        { error: 'PDF generation service unavailable' },
        { status: 503 }
      )
    }

    console.log('Generating PDF for invoice:', invoiceData.invoiceNumber)

    let browser: any
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })

      const page = await browser.newPage()

      const html = generateInvoiceHTML(invoiceData)
      
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      })

      await page.close()
      await browser.close()

      console.log('PDF generated successfully for invoice:', invoiceData.invoiceNumber)

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`
        }
      })

    } catch (error) {
      console.error('Error generating PDF:', error)
      if (browser) {
        await browser.close()
      }
      return NextResponse.json(
        { error: 'Failed to generate PDF' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(data: InvoiceData): string {
  const invoiceItems = data.items.map((item, index) => `
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">${index + 1}</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">${item.particulars}</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.hsnCode}</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity} UNIT</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
      <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">₹${item.amount.toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TAX INVOICE - ${data.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .business-details {
          text-align: left;
          margin-top: 20px;
        }
        .business-details h2 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .business-details p {
          margin: 5px 0;
          font-size: 14px;
          color: #666;
        }
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .column {
          display: flex;
          flex-direction: column;
        }
        .section {
          border: 1px solid #d1d5db;
          padding: 16px;
          margin-bottom: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .section h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
        .section p {
          margin: 5px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table th {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
          font-weight: 500;
          font-size: 14px;
          color: #111827;
        }
        table td {
          border: 1px solid #d1d5db;
          padding: 8px;
          font-size: 14px;
          color: #374151;
        }
        table th:nth-child(1),
        table td:nth-child(1) {
          text-align: left;
        }
        table th:nth-child(2),
        table td:nth-child(2) {
          text-align: left;
        }
        table th:nth-child(3),
        table td:nth-child(3) {
          text-align: center;
        }
        table th:nth-child(4),
        table td:nth-child(4) {
          text-align: center;
        }
        table th:nth-child(5),
        table td:nth-child(5) {
          text-align: right;
        }
        table th:nth-child(6),
        table td:nth-child(6) {
          text-align: right;
        }
        .tax-summary {
          border: 1px solid #d1d5db;
          padding: 12px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .tax-summary .space-y-2 {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .tax-summary .space-y-2 > * + * {
          margin-top: 8px;
        }
        .tax-summary .flex {
          display: flex;
        }
        .tax-summary .justify-between {
          justify-content: space-between;
        }
        .tax-summary .text-xs {
          font-size: 12px;
        }
        .tax-summary .text-sm {
          font-size: 14px;
        }
        .tax-summary .text-gray-600 {
          color: #4b5563;
        }
        .tax-summary .text-gray-900 {
          color: #111827;
        }
        .tax-summary .font-bold {
          font-weight: bold;
        }
        .tax-summary .border-t {
          border-top: 1px solid #d1d5db;
        }
        .tax-summary .pt-2 {
          padding-top: 8px;
        }
        .tax-summary .mt-2 {
          margin-top: 8px;
        }
        .total {
          font-weight: bold;
          font-size: 16px;
        }
        .amount-in-words {
          margin-bottom: 24px;
        }
        .amount-in-words p {
          margin: 0;
          font-size: 14px;
          color: #4b5563;
        }
        .amount-in-words .font-medium {
          font-weight: 500;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
        }
        .footer-left {
          font-size: 14px;
          color: #4b5563;
        }
        .footer-left p {
          margin: 0 0 8px 0;
        }
        .footer-left .font-semibold {
          font-weight: 600;
          color: #111827;
        }
        .footer-right {
          text-align: right;
        }
        .footer-right p {
          margin: 5px 0;
          font-size: 14px;
        }
        .signatory-section {
          margin-top: 32px;
          padding-top: 16px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TAX INVOICE</h1>
          <div class="business-details">
            <h2>${data.supplier.businessName}</h2>
            <p>${data.supplier.address.replace(/\n/g, '<br>')}</p>
            <p>GSTIN: ${data.supplier.gstin}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
              <p>Email: ${data.supplier.email}</p>
              <p>Phone: ${data.supplier.phone}</p>
            </div>
          </div>
        </div>

        <div class="two-column">
          <div class="column">
            <div class="section">
              <h3>Bill To</h3>
              <p><strong>${data.customer.customerName}</strong></p>
              <p>${data.customer.businessName}</p>
              <p>${data.customer.address.replace(/\n/g, '<br>')}</p>
              <p>GSTIN: ${data.customer.gstin}</p>
            </div>
          </div>
          <div class="column">
            <div class="section">
              <h3>Invoice Details</h3>
              <p><strong>Place of Supply:</strong> ${data.placeOfSupply}</p>
              <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${data.invoiceDate}</p>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Particulars</th>
              <th>HSN Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceItems}
          </tbody>
        </table>

        <div class="two-column">
          <div class="column"></div>
          <div class="column">
            <div class="tax-summary">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Taxable Value:</span>
                  <span class="text-gray-900">₹${data.taxableValue.toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">CGST (${data.cgstRate}%):</span>
                  <span class="text-gray-900">₹${data.cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">SGST (${data.sgstRate}%):</span>
                  <span class="text-gray-900">₹${data.sgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div class="border-t pt-2 mt-2">
                  <div class="flex justify-between font-bold text-sm">
                    <span class="text-gray-900">TOTAL:</span>
                    <span class="text-gray-900">₹${data.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="amount-in-words">
          <p class="text-sm text-gray-600">
            <span class="font-medium">Amount in Words:</span> ${data.amountInWords}
          </p>
        </div>

        <div class="footer">
          <div class="footer-left">
            <p>Account Number: <span class="font-semibold">${data.supplier.accountNumber}</span></p>
            <p>IFSC Code: <span class="font-semibold">${data.supplier.ifscCode}</span></p>
            ${data.supplier.accountName ? `<p>Account Name: <span class="font-semibold">${data.supplier.accountName}</span></p>` : ''}
            <p>PAN: <span class="font-semibold">${data.supplier.pan}</span></p>
            <p>This is a computer-generated invoice and does not require signature.</p>
          </div>
          <div class="footer-right">
            <div class="signatory-section">
              <p><strong>${data.supplier.businessName}</strong></p>
              <p>Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
