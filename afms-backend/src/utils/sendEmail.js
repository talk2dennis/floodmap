import { createTransport } from 'nodemailer'

// Create a transporter object using the default SMTP transport
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Function to send email
const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"AFMS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  })
  // Send mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred: ' + error.message)
    }
    console.log('Message sent: %s', info.messageId)
  })
}

export default sendMail
