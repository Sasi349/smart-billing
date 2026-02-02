# Email Configuration Setup

To enable the invoice email functionality, you need to configure the following environment variables in your `.env.local` file:

## System-Controlled Email Configuration

The system uses a single, static sender email for all invoice deliveries. Configure these variables in your `.env.local` file:

```bash
# System Email Service Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="system@yourcompany.com"      # System email account
EMAIL_PASS="your-app-password"           # System email app password
EMAIL_FROM="system@yourcompany.com"      # Must match EMAIL_USER
```

## Important Requirements

⚠️ **EMAIL_FROM must match EMAIL_USER** - The sender email must be the same as the authenticated email account for proper SMTP authentication.

## Gmail Setup Instructions

1. **Create a dedicated system email account** (e.g., `billing@yourcompany.com`)
2. **Enable 2-Factor Authentication** on the system email account
3. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password as EMAIL_PASS

## How It Works

- **Static Sender**: All invoices are sent from `EMAIL_FROM` (system email)
- **Dynamic Recipient**: Emails are sent to the logged-in user's email address
- **Automatic Delivery**: Invoices are automatically sent when generated
- **Manual Resend**: Users can manually resend invoices if needed

## Alternative Email Providers

### Outlook/Hotmail:
```bash
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

### Yahoo:
```bash
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

## Configuration Variables Explained

- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port (usually 587 for TLS, 465 for SSL)
- `EMAIL_SECURE`: Set to "true" for SSL (port 465), "false" for TLS (port 587)
- `EMAIL_USER`: System email account for authentication
- `EMAIL_PASS`: System email app password
- `EMAIL_FROM`: Static sender email (must match EMAIL_USER)

## Testing

After configuration, restart your development server and test the email functionality by:

1. Creating an invoice
2. The email will be automatically sent to your logged-in user's email
3. Check the console logs for any errors
4. Verify the email is received from the system email address

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of your main email password
- Use a dedicated system email account for all invoice deliveries
- For production, consider using services like SendGrid, Mailgun, or AWS SES
- The system email credentials are never exposed to client-side code
