import Mailjet from 'node-mailjet'

const buildClient = () => {
  const apiKey = process.env.MAILJET_API_KEY
  const apiSecret = process.env.MAILJET_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('MAILJET_API_KEY or MAILJET_API_SECRET is not configured')
  }

  return Mailjet.apiConnect(apiKey, apiSecret)
}

const getFromAddress = () => {
  const fromEmail = process.env.MAILJET_FROM_EMAIL
  if (!fromEmail) {
    throw new Error('MAILJET_FROM_EMAIL is not configured')
  }

  return {
    Email: fromEmail,
    Name: process.env.MAILJET_FROM_NAME || 'AFMS'
  }
}

const toRecipients = to => {
  const recipients = Array.isArray(to) ? to : [to]
  return recipients.filter(Boolean).map(email => ({ Email: email }))
}

const toTextPart = ({ text, html }) => {
  if (text) return text
  if (!html) return undefined
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Function to send email using Mailjet v3.1 API
const sendMail = async ({ to, subject, html, text }) => {
  const recipients = toRecipients(to)
  if (recipients.length === 0) {
    throw new Error('At least one recipient email is required')
  }

  const mailjet = buildClient()
  const response = await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: getFromAddress(),
        To: recipients,
        Subject: subject,
        HTMLPart: html,
        TextPart: toTextPart({ text, html })
      }
    ]
  })

  return response?.body
}

export default sendMail
