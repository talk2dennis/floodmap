import axios from 'axios'
import Alert from '../alerts/alert.model.js'
import { GoogleGenAI } from '@google/genai'

const chat = async (req, res) => {
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
    const user = req.user

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

    User Location:
    State: ${user.location?.state || 'Unknown'}
    LGA: ${user.location?.lga || 'Unknown'}
    Active Alerts:
    ${alertContext || 'No active alerts'}
    `

    // call the chatbot gemini api
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      systemInstruction: {
        parts: [{ text: systemPrompt }]
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
      throw new Error('AI response was empty or malformed.')
    }

    res.status(200).json({
      message: response.text,
      context: {
        alertContext
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export { chat }
