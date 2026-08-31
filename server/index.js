const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { OpenAI } = require('openai')

const envPath = path.resolve(__dirname, '../.env')
const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
  console.warn('Could not load .env file at', envPath, envResult.error)
}

const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim() || ''
const AZURE_KEY = process.env.AZURE_OPENAI_KEY?.trim()
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT?.trim()

const AZURE_ENDPOINT = rawEndpoint.replace(/\/+$/, '')
const AZURE_BASE_URL = AZURE_ENDPOINT.includes('/openai/v1') ? AZURE_ENDPOINT : `${AZURE_ENDPOINT}/openai/v1`

console.log('Loaded Azure config:', {
  endpoint: Boolean(rawEndpoint),
  deployment: Boolean(AZURE_DEPLOYMENT),
  keySet: Boolean(AZURE_KEY),
})

if (!AZURE_ENDPOINT || !AZURE_KEY || !AZURE_DEPLOYMENT) {
  console.error('Missing Azure OpenAI configuration. Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT in .env')
}

let client
if (!AZURE_ENDPOINT || !AZURE_KEY || !AZURE_DEPLOYMENT) {
  // Provide a lightweight mock client for local development when Azure keys are not set.
  client = {
    responses: {
      create: async ({ input }) => {
        const text = typeof input === 'string' ? input : JSON.stringify(input)
        // Return a simple mock that echoes the prompt for easy local testing.
        return { output_text: `MOCK_RESPONSE:\n${text}` }
      }
    }
  }
} else {
  console.log('Using real Azure OpenAI deployment:', AZURE_DEPLOYMENT)
  client = new OpenAI({ apiKey: AZURE_KEY, baseURL: AZURE_BASE_URL })
}

const app = express()
app.use(cors())
app.use(express.json())

const parseJsonFromText = (text) => {
  if (!text) return null
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch (err) {
    return null
  }
}

const buildPrompt = ({ profile, mode, scenario, compareA, compareB }) => {
  if (mode === 'scenario') {
    return `You are FuturePath AI Career Copilot, a professional career coach. Based on this user profile:\n\n` +
      `Name: ${profile.name}\nAge: ${profile.age}\nEducation: ${profile.education}\nQualifications: ${profile.qualifications}\nCareer goal: ${profile.goal}\nSkills: ${profile.skills}\nInterests: ${profile.interests}\nPreferred industry: ${profile.industry}\n\n` +
      `The user asks: ${scenario}\n\n` +
      `Answer as a career coach. Provide a short advisory response about what this decision means, what alternatives they should consider, and the key consequences. Return only plain text.`
  }

  if (mode === 'compare') {
    return `You are FuturePath AI Career Copilot, a professional career coach. Compare these two careers for this user:\n\n` +
      `Career A: ${compareA}\nCareer B: ${compareB}\n\n` +
      `Provide a side-by-side comparison with skills required, growth potential, learning path, and opportunity availability. Return only valid JSON in the following structure:\n` +
      `{\n  "careerA": {"skills": [], "growth": "", "learningPath": [], "opportunityAvailability": ""},\n  "careerB": {"skills": [], "growth": "", "learningPath": [], "opportunityAvailability": ""}\n}`
  }

  return `You are FuturePath AI Career Copilot, a professional career coach. Given this user profile:\n\n` +
    `Name: ${profile.name}\nAge: ${profile.age}\nEducation: ${profile.education}\nQualifications: ${profile.qualifications}\nCareer goal: ${profile.goal}\nSkills: ${profile.skills}\nInterests: ${profile.interests}\nPreferred industry: ${profile.industry}\n\n` +
    `Provide a structured career recommendation. Return ONLY valid JSON with these keys:\n` +
    `- target\n- description\n- demand\n- existingSkills\n- missingSkills\n- readiness\n- certifications\n- resources\n- jobs\n- internships\n- scholarships\n- roadmap\n\n` +
    `Use arrays for list fields and provide concise, useful text. If a field cannot be determined, return an empty array or empty string.`
}

app.post('/api/ai-career-agent', async (req, res) => {
  const { profile, mode = 'plan', scenario = '', compareA = '', compareB = '' } = req.body
  if (mode === 'plan' && !profile) {
    return res.status(400).json({ error: 'Missing profile data' })
  }

  try {
    const prompt = buildPrompt({ profile, mode, scenario, compareA, compareB })

    // Use Chat Completions API instead of Responses API
    let response
    if (!AZURE_ENDPOINT || !AZURE_KEY || !AZURE_DEPLOYMENT) {
      // Mock response for offline mode
      response = {
        choices: [{ message: { content: `MOCK_RESPONSE:\n${prompt}` } }]
      }
    } else {
      // Use Chat Completions endpoint
      response = await client.chat.completions.create({
        model: AZURE_DEPLOYMENT,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 900,
      })
    }

    const text = response.choices?.[0]?.message?.content || ''
    if (!text.trim()) {
      console.error('Azure response was empty', JSON.stringify(response, null, 2))
      return res.status(502).json({ error: 'Azure OpenAI returned an empty response' })
    }

    const result = parseJsonFromText(text)
    return res.json({ raw: text, result: result ?? { raw: text } })
  } catch (error) {
    console.error('AI error:', error)
    return res.status(500).json({ error: error.message || 'AI request failed' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`AI server listening on http://localhost:${port}`)
})
