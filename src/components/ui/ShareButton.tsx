'use client'

import { useState } from 'react'

export default function ShareButton({ pathId, isPaid }: { pathId: string; isPaid: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    // Generate the clean public viewing route string dynamically
    const shareUrl = `${window.location.origin}/path/${pathId}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      // Reset the button confirmation text after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err)
    }
  }

  // If the path hasn't been paid for, hide the sharing option to prevent confusion
  if (!isPaid) return null

  return (
    <button
      onClick={handleCopy}
      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 animate-scale" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Copied Link!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.664-4.664m0 0l-1.023-1.023m1.023 1.023l-1.023 1.023m0 0L8.684 13.258m0 0L4.02 8.594m0 0l1.022-1.022M4.02 8.594l1.022 1.022M12 21a9 9 0 110-18 9 9 0 010 18z" strokeDasharray="2 2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742a3 3 0 11-4.664 4.664 3 3 0 014.664-4.664zm8.632-6.584a3 3 0 11-4.663 4.663 3 3 0 014.663-4.663zm0 13.168a3 3 0 11-4.663 4.663 3 3 0 014.663-4.663z" />
          </svg>
          Share Gift Path
        </>
      )}
    </button>
  )
}