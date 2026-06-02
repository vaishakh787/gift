import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-gray-100">
        <div className="text-2xl font-black text-indigo-600 tracking-tighter">
          GiftPaths.
        </div>
        <Link 
          href="/login" 
          className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold tracking-wide mb-8">
          <span className="flex w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
          The most meaningful digital gift
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mb-6">
          Pass down your passions to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">next generation.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mb-12 leading-relaxed">
          Don't just text a YouTube link. Curate an interactive digital treasure map of videos, books, and personal notes for your nieces, nephews, and grandchildren.
        </p>

        <Link 
          href="/login"
          className="bg-indigo-600 text-white text-lg font-bold py-4 px-10 rounded-full hover:bg-indigo-700 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-indigo-500/30"
        >
          Curate a Gift Path &rarr;
        </Link>

        {/* How It Works Section */}
        <div className="mt-32 w-full max-w-5xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-16">How it works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-full">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl mb-6">1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Curate the Content</h4>
                <p className="text-gray-500 leading-relaxed">Paste YouTube videos, book links, and articles. Our engine automatically pulls the beautiful thumbnails and titles.</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-full">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl mb-6">2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Add Your Voice</h4>
                <p className="text-gray-500 leading-relaxed">Weave personal quotes and explanations between the links to explain *why* you are sharing this with them.</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-full">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl mb-6">3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Publish & Share</h4>
                <p className="text-gray-500 leading-relaxed">Pay a small fee to publish the path. You get a beautiful, interactive digital timeline to send them instantly.</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}