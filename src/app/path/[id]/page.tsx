import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PathViewer({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  // Add 'await' here!
  const supabase = await createClient()

  const { data: path, error: pathError } = await supabase
    .from('paths')
    .select('*')
    .eq('id', id)
    .single()

  if (pathError || !path) {
    return notFound()
  }

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

function TimelineCard({ milestone }: { milestone: any }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
        {milestone.content_type}
      </span>
      {milestone.image_url && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-100">
          <img 
            src={milestone.image_url} 
            alt="preview" 
            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
        {milestone.title || 'Personal Note'}
      </h3>
      {milestone.description && (
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {milestone.description}
        </p>
      )}
      {milestone.url && (
        <a 
          href={milestone.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-bold tracking-wide"
        >
          Explore Link 
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}
    </div>
  )
}