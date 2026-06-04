import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ShareButton from '@/components/ui/ShareButton'
import PaymentButton from '@/components/ui/PaymentButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Enforce server-side route protection
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch paths curated by this specific user
  const { data: paths, error } = await supabase
    .from('paths')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paths:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Dashboard Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-xl font-black text-indigo-600 tracking-tighter">
            GiftPaths.
          </div>
          
          {/* User Controls and Creation Trigger */}
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Logged in: <span className="text-gray-700 font-bold">{user.email}</span>
            </span>
            
            {/* Native Form hitting our secure Sign Out API */}
            <form action="/api/auth/signout" method="POST" className="m-0">
              <button 
                type="submit"
                className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </form>

            <Link
              href="/dashboard/create"
              className="bg-indigo-600 text-white text-sm font-bold py-2.5 px-5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Create New Path
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="max-w-5xl mx-auto px-6 mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Curated Gift Paths</h1>

        {paths && paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths.map((path) => (
              <div key={path.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{path.title}</h2>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      path.is_paid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {path.is_paid ? 'Active' : 'Unpaid Shell'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    For: <span className="font-semibold text-gray-700">{path.giftee_name}</span>
                  </p>
                  {path.personal_message && (
                    <p className="text-gray-600 text-sm italic line-clamp-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                      "{path.personal_message}"
                    </p>
                  )}
                </div>

                {/* The Updated Action Footer Panel */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/path/${path.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Preview Viewer
                  </Link>
                  
                  {/* Dynamic Action State Switch */}
                  {path.is_paid ? (
                    <ShareButton pathId={path.id} isPaid={path.is_paid} />
                  ) : (
                    <PaymentButton pathId={path.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State View */
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto mt-12 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-6">
              🎁
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No paths created yet</h3>
            <p className="text-gray-500 mb-8">Get started by creating your very first interactive digital journey for a loved one.</p>
            <Link
              href="/dashboard/create"
              className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors inline-block shadow-md shadow-indigo-500/10"
            >
              Curate Your First Path
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}