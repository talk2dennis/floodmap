import { createTransport } from 'nodemailer'

const buildTransporter = () => {
  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured')
  }

  const port = Number(process.env.SMTP_PORT || 587)
  const secure =
    String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'

  const authUser = process.env.SMTP_USER
  const authPass = process.env.SMTP_PASS

  return createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined
  })
}

// Function to send email
const sendMail = async ({ to, subject, html, text }) => {
  const transporter = buildTransporter()
  await transporter.sendMail({
    from: `"AFMS" <${process.env.SMTP_USER || 'no-reply@afms.local'}>`,
    to,
    subject,
    html,
    text
  })
}

export default sendMail
