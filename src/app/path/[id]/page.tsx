import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PathViewer({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Check user login status FIRST
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch Path details
  const { data: path, error: pathError } = await supabase
    .from('paths')
    .select('*')
    .eq('id', id)
    .single()

  // 3. Smart Gatekeeper Layer
  if (pathError || !path) {
    // If the row is hidden or missing, and they are logged out, show the locked paywall screen
    if (!user) {
      return <LockedPaywallScreen id={id} />
    }
    // If they ARE logged in but it's still missing, it truly doesn't exist
    return notFound()
  }

  // If the path exists but is unpaid, check if this logged-in user built it
  const isCreator = user && path.creator_id === user.id
  if (!path.is_paid && !isCreator) {
    return <LockedPaywallScreen id={id} />
  }

  // 4. Fetch Milestones if authorized
  const { data: milestones, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .eq('path_id', id)
    .order('display_order', { ascending: true })

  if (milestonesError) {
    console.error("Error fetching milestones:", milestonesError)
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-32">
      {/* Admin Draft Banner Notice */}
      {!path.is_paid && isCreator && (
        <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-3 px-4 text-sm font-bold tracking-wide shadow-inner flex items-center justify-center gap-2 sticky top-0 z-50">
          <span>⚠️ Draft Mode: This path is unpaid and invisible to the public. Only you can see this preview.</span>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full bg-white border-b border-gray-200 py-20 px-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-3">
            A Curated Journey For
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            {path.giftee_name}
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-700 font-medium mb-8">
            {path.title}
          </h2>
          {path.personal_message && (
            <div className="max-w-2xl mx-auto bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
              <p className="text-xl text-gray-600 italic leading-relaxed">
                "{path.personal_message}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Timeline Section */}
      <div className="max-w-5xl mx-auto px-4 mt-24 relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-200 rounded-full transform md:-translate-x-1/2 shadow-inner" />

        <div className="space-y-16 md:space-y-24">
          {milestones?.map((milestone, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={milestone.id} className="relative flex flex-col md:flex-row items-center w-full group">
                <div className="absolute left-4 md:left-1/2 w-10 h-10 bg-indigo-600 rounded-full transform -translate-x-1/2 flex items-center justify-center border-4 border-white shadow-md z-10 transition-transform group-hover:scale-110">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div className={`w-full md:w-1/2 pl-12 md:px-12 ${isEven ? 'md:text-right md:pr-12' : 'md:hidden'}`}>
                  {isEven && <TimelineCard milestone={milestone} />}
                </div>
                <div className={`w-full md:w-1/2 pl-12 md:px-12 mt-8 md:mt-0 ${!isEven ? 'md:pl-12' : 'md:hidden'}`}>
                  {!isEven && <TimelineCard milestone={milestone} />}
                </div>
                <div className="w-full pl-16 pr-4 md:hidden">
                   <TimelineCard milestone={milestone} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

function LockedPaywallScreen({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center px-4 selection:bg-indigo-500/30">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-indigo-500/20">
          🔒
        </div>
        
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          A Journey Awaits...
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          A beautiful curated digital discovery path has been prepared for someone special, but it hasn't been completely published by the creator yet.
        </p>
        
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/30 text-xs font-mono text-indigo-400 break-all mb-4">
          Path ID: {id.substring(0, 8)}...
        </div>
        
        <p className="text-xs text-slate-500">
          If you are the creator, please log into your dashboard to process payment and unlock this route.
        </p>
      </div>
    </div>
  )
}

function TimelineCard({ milestone }: { milestone: any }) {
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (milestone.content_type === 'quote') {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl shadow-md border border-slate-800 text-left relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute -top-4 -left-2 text-8xl text-indigo-700/30 font-serif pointer-events-none select-none">
          “
        </div>
        <blockquote className="relative z-10">
          <p className="text-xl md:text-2xl text-indigo-100 font-medium italic leading-relaxed mb-4">
            {milestone.url || 'No quote text provided yet.'}
          </p>
          <footer className="text-sm font-bold tracking-wider text-indigo-400 uppercase">
            — Words of Wisdom
          </footer>
        </blockquote>
      </div>
    );
  }

  const videoId = milestone.content_type === 'video' ? getYouTubeId(milestone.url) : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4 ${
        milestone.content_type === 'video' ? 'bg-red-50 text-red-600 border border-red-100' :
        milestone.content_type === 'book' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
        'bg-blue-50 text-blue-600 border border-blue-100'
      }`}>
        {milestone.content_type === 'video' ? '📹 Video' : milestone.content_type === 'book' ? '📚 Recommended Book' : '📰 Article'}
      </span>
      
      {videoId ? (
        <div className="mb-5 aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={milestone.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        milestone.image_url && (
          <div className="mb-5 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img 
              src={milestone.image_url} 
              alt="preview" 
              className="w-full h-48 object-cover transform group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        )
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
        {milestone.title || 'External Link'}
      </h3>
      
      {milestone.description && (
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">
          {milestone.description}
        </p>
      )}
      
      {milestone.url && (
        <a 
          href={milestone.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-bold tracking-wide mt-2"
        >
          Open Material 
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}
    </div>
  );
}