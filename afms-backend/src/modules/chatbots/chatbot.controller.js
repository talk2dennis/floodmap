import Alert from '../alerts/alert.model.js'
import { GoogleGenAI } from '@google/genai'
import User from '../users/user.model.js'

const chat = async (req, res) => {
  console.log('Chat request received with body:', req.body)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  const GEMINI_API_URL = process.env.GEMINI_API_BASE_URL
  // check if api key and url are set
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return res
      .status(500)
      .json({ message: 'Chatbot API key or URL not configured' })
  }

  try {
    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

    const { message } = req.body
    const user = await User.findById(req.user.id).select('name state lga')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!message)
      return res.status(400).json({ message: 'Message is required' })
    // Get relevant alerts (context awareness)
    const alerts = await Alert.find({
      'target.state': user.state,
      status: 'SENT'
    }).limit(3)

    // Call the chatbot API
    const alertContext = alerts
      .map(a => `- ${a.title}: ${a.message}`)
      .join('\n')

    const systemPrompt = `
    You are an AI assistant for a Flood Management System.
    Your role is to provide accurate, calm, and actionable flood-related advice.

    Rules:
    - Only answer flood, rainfall, evacuation, safety, and preparedness questions.
    - Do NOT speculate or predict weather.
    - Encourage users to follow official alerts.
    - If the situation sounds life-threatening, advise contacting emergency services.
    - Keep every reply to a maximum of 3 paragraphs.
    - Personalize the response using the user's name when available.
    - Be context-aware of the user's location details (state and LGA).

    User Details:
    Name: ${user.name.split(' ')[0] || 'User'}
    State: ${user.state || 'Unknown'}
    LGA: ${user.lga || 'Unknown'}

    Active Alerts:
    ${alertContext || 'No active alerts'}
    `

    // call the chatbot gemini api
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.3
      }
    })

    if (!response || !response.text) {
      return res.status(500).json({ message: 'No response from chatbot' })
    }

    res.status(200).json({
      message: response.text,
      context: {
        alertContext
      }
    })
  } catch (error) {
    res.status(500).json({ message: `Chatbot error: ${error.message}` })
  }
}

export { chat }
