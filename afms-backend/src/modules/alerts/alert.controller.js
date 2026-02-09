import Alert from './alert.model.js'
import sendEmail from '../../utils/sendEmail.js'
import User from '../users/user.model.js'

export const createAlert = async (req, res) => {
  try {
    const { title, message, severity, target, channels } = req.body
    const alert = await Alert.create({
      title,
      message,
      severity,
      target,
      channels,
      createdBy: req.user.id
    })
    res.status(201).json({
      message: 'Alert created',
      alert
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getAlerts = async (req, res) => {
  try {
    const query = {}

    if (req.user.role !== 'ADMIN') {
      query['target.state'] = req.user.location?.state
    }

    const alerts = await Alert.find(query).sort('-createdAt')
    res.json(alerts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    res.status(200).json(alert)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    res.status(200).json(alert)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id)
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    res.status(200).json({ message: 'Alert deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const sendAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
    if (!alert) return res.status(404).json({ message: 'Alert not found' })

    if (alert.status === 'SENT')
      return res.status(400).json({ message: 'Alert already sent' })

    // Find target users
    const query = {}
    if (alert.target?.state) query['location.state'] = alert.target.state
    if (alert.target?.lga) query['location.lga'] = alert.target.lga

    const users = await User.find(query)
    // EMAIL DELIVERY
    if (alert.channels.email) {
      const logoUrl =
        process.env.SCHOOL_LOGO_URL ||
        'https://res.cloudinary.com/dhtwzgd0x/image/upload/v1770545734/afms_logo_ci5vlw.png'
      const sentAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
      const severityConfig = {
        LOW: { label: 'Low', color: '#1f7a1f', bg: '#e9f7ec' },
        MEDIUM: { label: 'Medium', color: '#b15c00', bg: '#fff4e5' },
        HIGH: { label: 'High', color: '#b00020', bg: '#fde8ec' },
        CRITICAL: { label: 'Critical', color: '#7a0014', bg: '#fde8ec' }
      }
      const severityKey = String(alert.severity || '').toUpperCase()
      const severity = severityConfig[severityKey] || {
        label: alert.severity || 'Unknown',
        color: '#3a3a3a',
        bg: '#f2f2f2'
      }

      for (const user of users) {
        if (user.email) {
          await sendEmail({
            to: user.email,
            subject: alert.title,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e6e6e6; border-radius: 10px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0f3d3e 0%, #1b6b6f 100%); padding: 20px; text-align: center;">
                <img src="${logoUrl}" alt="School Logo" style="width: 140px; height: auto; display: block; margin: 0 auto 8px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">${
                  alert.title
                }</h1>
                <p style="color: #e6f2f2; margin: 6px 0 0; font-size: 13px;">Sent at ${sentAt}</p>
              </div>
              <div style="padding: 24px 28px 16px; background: #ffffff;">
                <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.6;">Hello ${
                  user.name || 'there'
                },</p>
                <p style="margin: 0 0 18px; color: #444444; font-size: 14px; line-height: 1.7;">${
                  alert.message
                }</p>
                <div style="display: inline-block; background: ${
                  severity.bg
                }; color: ${
              severity.color
            }; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; letter-spacing: 0.3px;">
                  Severity: ${severity.label}
                </div>
              </div>
              <div style="padding: 12px 28px 24px; background: #f7fafb; border-top: 1px solid #eef2f4;">
                <p style="margin: 0; color: #56606a; font-size: 12px; line-height: 1.6;">This is an official alert from AFMS FloodMap. Please follow guidance from your institution and local authorities.</p>
              </div>
            </div>
          `
          })
        }
      }
    }
    // expo push notification delivery
    // if (alert.channels.push) {
    //   for (const user of users) {
    //     if (user.expoPushToken) {
    //       await sendPushNotification({
    //         to: user.expoPushToken,
    //         title: alert.title,
    //         body: alert.message
    //       })
    //     }
    //   }
    // }
    alert.status = 'SENT'
    await alert.save()

    res.json({ message: 'Alert sent successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
