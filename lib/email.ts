import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // System-controlled email configuration
      this.config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || '' // Must be explicitly set
      }

      // Validate required system email configuration
      if (!this.config.user || !this.config.pass || !this.config.from) {
        console.warn('Email credentials not properly configured. Required: EMAIL_USER, EMAIL_PASS, EMAIL_FROM')
        return
      }

      // Ensure sender email matches authenticated user (system email)
      if (this.config.from !== this.config.user) {
        console.warn('EMAIL_FROM must match EMAIL_USER for proper authentication')
        // Fallback to authenticated user email
        this.config.from = this.config.user
      }

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass
        }
      })

      console.log(`Email service initialized with system sender: ${this.config.from}`)
    } catch (error) {
      console.error('Failed to initialize email service:', error)
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter || !this.config) {
      const error = 'Email service not configured'
      console.error(error)
      return { success: false, error }
    }

    try {
      const mailOptions = {
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to send email:', {
        error: errorMessage,
        to: options.to,
        subject: options.subject
      })
      
      return { success: false, error: errorMessage }
    }
  }

  async sendInvoiceEmail(
    userEmail: string,
    invoiceNumber: string,
    pdfBuffer: Buffer
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `Invoice ${invoiceNumber} - Smart Billing System`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Invoice Generated</h2>
        <p>Dear User,</p>
        <p>Your invoice <strong>${invoiceNumber}</strong> has been generated successfully.</p>
        <p>Please find the invoice attached to this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated email from the Smart Billing System.<br>
            If you have any questions, please contact support.
          </p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })
  }

  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null
  }
}

export const emailService = new EmailService()
