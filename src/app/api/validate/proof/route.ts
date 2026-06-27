import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { proof_id } = await request.json()

    const { data: proof } = await supabaseAdmin
      .from('milestone_proofs')
      .select('*, milestones(*)')
      .eq('id', proof_id)
      .single()

    if (!proof) return NextResponse.json({ error: 'Target tracking record missing' }, { status: 404 })

    // Call OpenAI multi-modal checking logic
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Verify user proof submittals against structural criteria. Return JSON string: { "score": number, "approved": boolean, "reasoning": "string" }'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Target Benchmark Instructions: ${proof.milestones.expected_proof_criteria}` },
            { type: 'image_url', image_url: { url: proof.uploaded_asset_url } }
          ]
        }
      ]
    })

    const evaluation = JSON.parse(response.choices[0].message.content || '{}')
    const finalStatus = evaluation.score >= 85.00 && evaluation.approved ? 'ai_approved' : 'ai_rejected'

    const { data: validationRecord } = await supabaseAdmin
      .from('validation_results')
      .insert([{
        proof_id: proof.id,
        status: finalStatus,
        ai_confidence_score: evaluation.score,
        ai_analysis_reasoning: evaluation.reasoning
      }])
      .select()
      .single()

    // Programmatically execute escrow releases if criteria are completely satisfied
    if (finalStatus === 'ai_approved' && validationRecord) {
      await supabaseAdmin.rpc('settle_progressive_milestone_escrow', {
        target_validation_id: validationRecord.id
      })
    }

    return NextResponse.json({ success: true, status: finalStatus, score: evaluation.score })
  } catch (error: any) {
    console.error('Validation Route Defect Trace:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}