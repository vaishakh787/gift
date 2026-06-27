import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { topic, budget_rupees } = await request.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert computational development mentor. Subdivide a learning goal into a logical milestone roadmap.
          You must respond with a JSON object matching this schema exactly:
          {
            "title": "string",
            "category": "string",
            "difficulty_level": "Beginner" | "Intermediate" | "Advanced",
            "milestones": [
              {
                "title": "string",
                "description": "string",
                "reward_amount_paise": number,
                "expected_proof_criteria": "string"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: `Build an optimal path blueprint for mastering: "${topic}". Total gift pool budget allocation: ₹${budget_rupees}. Subdivide this capital evenly across milestones.`
        }
      ]
    })

    const blueprint = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({ success: true, blueprint })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}