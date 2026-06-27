import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path_id } = body
    const supabase = await createClient()

    if (!path_id) {
      return NextResponse.json({ error: 'path_id parameter is required' }, { status: 400 })
    }

    // Fetch path budget properties straight from database records
    const { data: path } = await supabase
      .from('paths')
      .select('total_gift_amount_paise')
      .eq('id', path_id)
      .single()

    const baseBudgetPaise = Number(path?.total_gift_amount_paise) || 50000; 
    const platformCommissionPaise = Math.round(baseBudgetPaise * 0.05);
    const totalInvoicePaise = baseBudgetPaise + platformCommissionPaise;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
    })

    const options = {
      amount: totalInvoicePaise, // Dynamic calculated capital billing (in Paise)
      currency: 'INR',
      receipt: `rcpt_${path_id.substring(0, 8)}`,
      notes: { path_id, base_budget: baseBudgetPaise.toString() },
    }

    const order = await razorpay.orders.create(options)
    
    return NextResponse.json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID 
    })
  } catch (error: any) {
    console.error('Razorpay Dynamic Invoicing Error Context:', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize system order pools' }, { status: 500 })
  }
}