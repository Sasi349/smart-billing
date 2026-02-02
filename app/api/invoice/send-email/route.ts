import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { emailService } from '@/lib/email'

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
    const { invoiceData, userEmail } = body

    if (!invoiceData || !userEmail) {
      return NextResponse.json(
        { error: 'Invoice data and user email are required' },
        { status: 400 }
      )
    }

    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    console.log('Generating PDF for invoice:', invoiceData.invoiceNumber)
    
    // Generate PDF using the dedicated PDF generation endpoint
    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invoice/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ invoiceData })
    })

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.json()
      console.error('PDF generation failed:', errorData.error)
      return NextResponse.json(
        { error: 'Failed to generate PDF: ' + errorData.error },
        { status: 500 }
      )
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    
    console.log('Sending email to:', userEmail)
    
    const emailResult = await emailService.sendInvoiceEmail(
      userEmail,
      invoiceData.invoiceNumber,
      Buffer.from(pdfBuffer)
    )

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email: ' + emailResult.error },
        { status: 500 }
      )
    }

    console.log('Invoice sent successfully:', {
      invoiceNumber: invoiceData.invoiceNumber,
      userEmail
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully to your email'
    })

  } catch (error) {
    console.error('Send invoice email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
