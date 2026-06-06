'use client'

import { useState } from 'react'

export default function PaymentButton({ pathId }: { pathId: string }) {
  const [loading, setLoading] = useState(false)

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async () => {
    setLoading(true)
    const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your network connection.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path_id: pathId }),
      })
      const data = await res.json()

      if (!data.success) throw new Error('Order creation failed')

      const options = {
        // Dynamically receive the Key ID parsed straight from the secure server config
        key: data.key_id, 
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'GiftPaths',
        description: 'Publish your interactive discovery journey',
        order_id: data.order.id,
        handler: function (response: any) {
          alert(`Transaction authorized! Reference ID: ${response.razorpay_payment_id}`)
          window.location.reload()
        },
        theme: { color: '#4f46e5' },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch (err) {
      console.error(err)
      alert('Payment setup failed. Please confirm your credentials configurations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-sm rounded-lg text-center transition-colors cursor-pointer shadow-sm disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay ₹500 to Publish'}
    </button>
  )
}