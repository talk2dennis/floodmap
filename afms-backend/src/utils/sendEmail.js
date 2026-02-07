import { createTransport } from 'nodemailer'

// Create a transporter object using the default SMTP transport
const transporter = createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com',
    pass: 'your-email-password'
  }
})

// Function to send email
const sendMail = (to, subject, text) => {
  const mailOptions = {
    from: 'your-email@example.com',
    to: to,
    subject: subject,
    text: text
  }

  // Send mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred: ' + error.message)
    }
    console.log('Message sent: %s', info.messageId)
  })
}

export default sendMail
