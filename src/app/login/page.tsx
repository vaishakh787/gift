'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirects straight to your existing PKCE session exchange route
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-4">
            🎁
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Gift Paths
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in instantly to start curating digital journeys
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-300 shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.72 1.514 6.655l3.752 3.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 15.345c-1.077.736-2.423 1.164-4.04 1.164a7.077 7.077 0 0 1-6.734-4.856L1.514 14.76A11.934 11.934 0 0 0 12 24c3.305 0 6.082-1.091 8.105-2.964l-4.064-3.69z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.864 12.218c0-.864-.077-1.7-.218-2.509H12v4.745h6.655a5.695 5.695 0 0 1-2.473 3.736l4.064 3.69c2.373-2.182 3.736-5.391 3.736-9.163z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235L1.514 17.345A11.934 11.934 0 0 1 0 12c0-1.927.455-3.745 1.255-5.364l4.011 3.118A7.012 7.012 0 0 0 4.91 12c0 .791.132 1.555.356 2.235z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-center text-xs font-semibold text-red-600">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}