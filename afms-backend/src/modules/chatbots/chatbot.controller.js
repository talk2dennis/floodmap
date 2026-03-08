import Alert from '../alerts/alert.model.js'
import { GoogleGenAI } from '@google/genai'
import User from '../users/user.model.js'
import Report from '../reports/report.model.js'
import { fetchWeatherApi } from 'openmeteo'

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildLocationRegex = value =>
  value && value.trim()
    ? new RegExp(`^${escapeRegex(value.trim())}$`, 'i')
    : undefined

const HELP_INTENT_PATTERNS = {
  evacuationChecklist:
    /evacuat|evacuation|leave home|relocat|safe route|shelter|where should i go/i,
  emergencyContacts:
    /emergency|helpline|hotline|contact|call who|rescue|ambulance|fire service/i,
  preparedness:
    /prepared|prepare|kit|supplies|bag|go-bag|before flood|readiness/i,
  immediateSafety:
    /flood now|water rising|trapped|urgent|danger|life[- ]?threat|immediate help/i,
  weather: /weather|rain|rainfall|forecast|storm|temperature|wind/i
}

const detectHelpIntents = message => {
  const text = message || ''
  return Object.entries(HELP_INTENT_PATTERNS)
    .filter(([, pattern]) => pattern.test(text))
    .map(([intent]) => intent)
}

const getIntentSupportContext = intents => {
  const blocks = []

  if (intents.includes('evacuationChecklist')) {
    blocks.push(
      `Evacuation checklist:\n- Carry go-bag (water, medication, ID, phone charger, torch).\n- Turn off electricity and gas if it is safe.\n- Move to higher ground and avoid floodwater routes.\n- Inform a trusted contact before moving.`
    )
  }

  if (
    intents.includes('emergencyContacts') ||
    intents.includes('immediateSafety')
  ) {
    blocks.push(
      'Emergency contact template: Local Emergency Management Agency, NEMA/SEMA desk, nearest hospital, police station, fire service, and trusted family contact.'
    )
  }

  if (intents.includes('preparedness')) {
    blocks.push(
      `Preparedness quick steps:\n- Keep emergency supplies for at least 72 hours.\n- Store documents in waterproof packaging.\n- Monitor verified alerts and have a family communication plan.`
    )
  }

  if (intents.includes('immediateSafety')) {
    blocks.push(
      'Immediate safety priority: prioritize evacuation to higher ground and contacting emergency services right away if there is imminent danger.'
    )
  }

  return blocks.join('\n\n') || 'No special help intent detected.'
}

const getWeatherContext = async userLocation => {
  if (!Array.isArray(userLocation) || userLocation.length !== 2) {
    return 'Weather context unavailable: user coordinates not set.'
  }

  const [longitude, latitude] = userLocation
  if (Number.isNaN(Number(latitude)) || Number.isNaN(Number(longitude))) {
    return 'Weather context unavailable: invalid user coordinates.'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    const params = {
      latitude,
      longitude,
      current: 'temperature_2m,precipitation,rain,weather_code,wind_speed_10m',
      hourly: 'precipitation_probability',
      forecast_days: 1,
      timezone: 'auto'
    }

    const responses = await fetchWeatherApi(WEATHER_URL, params, 3, 0.2, 2, {
      signal: controller.signal
    })

    const weatherResponse = responses?.[0]
    if (!weatherResponse) {
      return 'Weather context unavailable: weather provider request failed.'
    }

    const current = weatherResponse.current?.()
    const hourly = weatherResponse.hourly?.()

    const currentTemperature = current?.variables(0)?.value()
    const currentPrecipitation = current?.variables(1)?.value()
    const currentRain = current?.variables(2)?.value()
    const currentWeatherCode = current?.variables(3)?.value()
    const currentWindSpeed = current?.variables(4)?.value()

    const precipProbValues = hourly?.variables(0)?.valuesArray()
    const precipProb = precipProbValues
      ? Array.from(precipProbValues).slice(0, 6)
      : []

    return `Current weather near user location: temperature ${
      currentTemperature ?? 'N/A'
    } C, rain ${currentRain ?? 0} mm, precipitation ${
      currentPrecipitation ?? 0
    } mm, wind ${currentWindSpeed ?? 'N/A'} km/h, weather code ${
      currentWeatherCode ?? 'N/A'
    }. Next-hours precipitation probability samples: ${
      precipProb.length ? precipProb.join(', ') : 'N/A'
    }.`
  } catch (error) {
    if (error?.name === 'AbortError') {
      return 'Weather context unavailable: weather request timed out.'
    }
    return `Weather context unavailable: ${error.message}`
  } finally {
    clearTimeout(timeout)
  }
}

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
    const user = await User.findById(req.user.id).select(
      'name state lga location'
    )
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!message)
      return res.status(400).json({ message: 'Message is required' })

    const stateRegex = buildLocationRegex(user.state)
    const lgaRegex = buildLocationRegex(user.lga)

    const locationAlertFilter = {
      status: 'SENT',
      ...(stateRegex && {
        $or: [
          {
            $and: [
              { 'target.state': { $exists: true, $ne: null } },
              { 'target.state': stateRegex },
              ...(lgaRegex ? [{ 'target.lga': lgaRegex }] : [])
            ]
          },
          {
            $and: [
              { 'target.state': { $exists: true, $ne: null } },
              { 'target.state': stateRegex },
              {
                $or: [
                  { 'target.lga': { $exists: false } },
                  { 'target.lga': null },
                  { 'target.lga': '' }
                ]
              }
            ]
          }
        ]
      })
    }

    const locationReportFilter = {
      status: 'VERIFIED',
      ...(stateRegex ? { state: stateRegex } : {}),
      ...(lgaRegex ? { lga: lgaRegex } : {})
    }

    const helpIntents = detectHelpIntents(message)

    const [alerts, verifiedReports, weatherContext] = await Promise.all([
      Alert.find(locationAlertFilter).sort({ createdAt: -1 }).limit(5),
      Report.find(locationReportFilter).sort({ createdAt: -1 }).limit(5),
      getWeatherContext(user.location)
    ])

    const helpSupportContext = getIntentSupportContext(helpIntents)

    // Call the chatbot API
    const alertContext = alerts
      .map(
        a =>
          `- [${a.severity}] ${a.title}: ${a.message} (${
            a.target?.state || 'Unknown state'
          }${a.target?.lga ? `, ${a.target.lga}` : ''})`
      )
      .join('\n')

    const reportContext = verifiedReports
      .map(
        r =>
          `- [${r.severity}] ${r.title}: ${r.description} (${
            r.state || 'Unknown state'
          }${r.lga ? `, ${r.lga}` : ''})`
      )
      .join('\n')

    const systemPrompt = `
    You are an AI assistant for an AI powered Flood Management System - AFMS.
    Your role is to provide accurate, calm, and actionable flood safety guidance.

    Rules:
    - Answer flood, rainfall, evacuation, safety, preparedness, and general weather-help questions.
    - Use the Weather Snapshot when available, but clearly mention uncertainty and advise checking official weather agencies for critical decisions like NiMet and local Authority.
    - Use Active Alerts and Verified Community Reports as your primary local context.
    - If user asks for evacuation/safety help, provide a practical checklist.
    - If user asks for emergency contacts, provide a concise local contact template and recommend calling official emergency lines immediately for urgent risk.
    - Encourage users to follow official alerts.
    - If the situation sounds life-threatening, advise contacting emergency services.
    - Keep every reply to a maximum of 3 paragraphs.
    - Personalize the response using the user's name when available.
    - Be context-aware of the user's location details (state and LGA).

    User Details:
    Name: ${user.name.split(' ')[1] || user.name.split('')[0] || 'User'}
    State: ${user.state || 'Unknown'}
    LGA: ${user.lga || 'Unknown'}

    Active Alerts:
    ${alertContext || 'No active alerts'}

    Verified Community Reports:
    ${reportContext || 'No verified reports for this location'}

    Weather Snapshot:
    ${weatherContext}

    Help Intents Detected:
    ${helpIntents.length ? helpIntents.join(', ') : 'none'}

    Safety/Help Support Context:
    ${helpSupportContext}
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
        alertContext,
        reportContext,
        weatherContext,
        helpIntents
      }
    })
  } catch (error) {
    res.status(500).json({ message: `Chatbot error: ${error.message}` })
  }
}

export { chat }
