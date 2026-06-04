import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing validation signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'secret')
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Cryptographic hash validation failed' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    if (payload.event === 'payment.captured') {
      const pathId = payload.payload.payment.entity.notes?.path_id
      if (pathId) {
        await supabaseAdmin
          .from('paths')
          .update({ is_paid: true })
          .eq('id', pathId)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal operation fallback' }, { status: 500 })
  }
}