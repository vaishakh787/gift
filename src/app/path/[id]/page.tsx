import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PathViewer({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = createClient()

  // 1. Fetch the Path details
  const { data: path, error: pathError } = await supabase
    .from('paths')
    .select('*')
    .eq('id', id)
    .single()

  // If the path doesn't exist, throw a Next.js 404 page
  if (pathError || !path) {
    return notFound()
  }

  // 2. Fetch the associated Milestones in the correct order
  const { data: milestones, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .eq('path_id', id)
    .order('display_order', { ascending: true })

  if (milestonesError) {
    console.error("Error fetching milestones:", milestonesError)
  }

  // 3. Render the Foundation (Day 10 specifies a simple list for now)
  return (
    <div className="max-w-3xl mx-auto mt-16 p-6">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold text-gray-900">
          A Gift For {path.giftee_name}
        </h1>
        <h2 className="text-2xl text-indigo-600 font-medium">
          {path.title}
        </h2>
        {path.personal_message && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto italic mt-6">
            "{path.personal_message}"
          </p>
        )}
      </div>

      <div className="space-y-8">
        {milestones?.map((milestone, index) => (
          <div key={milestone.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-center">
            
            {/* Display the Number */}
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
              {index + 1}
            </div>

            {/* Display the Image (if scraped) */}
            {milestone.image_url && (
              <img 
                src={milestone.image_url} 
                alt="preview" 
                className="w-32 h-24 object-cover rounded-md shadow-sm"
              />
            )}

            {/* Display the Content */}
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {milestone.content_type}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {milestone.title || 'Personal Note'}
              </h3>
              {milestone.description && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {milestone.description}
                </p>
              )}
              {milestone.url && (
                <a 
                  href={milestone.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Explore Link &rarr;
                </a>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}