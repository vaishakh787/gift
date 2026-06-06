import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path_id } = body

    if (!path_id) {
      return NextResponse.json({ error: 'path_id parameter is required' }, { status: 400 })
    }

    const options = {
      amount: 50000, // ₹500 INR in Paise
      currency: 'INR',
      receipt: `rcpt_${path_id.substring(0, 8)}`,
      notes: { path_id },
    }

    const order = await razorpay.orders.create(options)
    
    // Return the generated order alongside the key context cleanly
    return NextResponse.json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID 
    })
  } catch (error) {
    console.error('Razorpay Order Creation failure trace:', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize order platform' }, { status: 500 })
  }
}