import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path_id } = body

    if (!path_id) {
      return NextResponse.json({ error: 'path_id parameter is required' }, { status: 400 })
    }

    // Lazy instantiate the SDK context safely inside the request runtime block
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
    })

    const options = {
      amount: 50000, // ₹500 INR in smallest units (Paise)
      currency: 'INR',
      receipt: `rcpt_${path_id.substring(0, 8)}`,
      notes: { path_id },
    }

    const order = await razorpay.orders.create(options)
    
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