'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AudioRecorder from '@/components/ui/AudioRecorder'

type Milestone = {
  id: string;
  content_type: 'video' | 'book' | 'article' | 'quote' | 'audio';
  url: string;
  title: string;
  description: string;
  image_url: string;
}

export default function CreatePathPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Path State
  const [gifteeName, setGifteeName] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  
  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Math.random().toString(36).substring(7),
      content_type: 'video',
      url: '',
      title: '',
      description: '',
      image_url: ''
    }])
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...milestones]
    ;(newMilestones[index] as any)[field] = value
    setMilestones(newMilestones)
  }

  const handleScrape = async (index: number, url: string) => {
    if (!url) return;
    updateMilestone(index, 'title', 'Loading preview...')
    
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      
      if (json.success) {
        const newMilestones = [...milestones]
        newMilestones[index].title = json.data.title || 'External Link'
        newMilestones[index].description = json.data.description || ''
        newMilestones[index].image_url = json.data.image || ''
        setMilestones(newMilestones)
      }
    } catch (error) {
      console.error("Scrape failed", error)
      updateMilestone(index, 'title', 'Failed to load preview')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 1. Insert the Path
    const { data: pathData, error: pathError } = await supabase
      .from('paths')
      .insert([{ 
        creator_id: user.id, 
        giftee_name: gifteeName, 
        title, 
        personal_message: message 
      }])
      .select()
      .single()

    if (pathError) {
      console.error("Path Error:", pathError)
      setLoading(false)
      return
    }

    // 2. Insert the Milestones linked to the new Path
    if (milestones.length > 0) {
      const milestonesToInsert = milestones.map((m, i) => ({
        path_id: pathData.id,
        content_type: m.content_type,
        url: m.url,
        title: m.title,
        description: m.description,
        image_url: m.image_url,
        display_order: i
      }))

      const { error: milestoneError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert)

      if (milestoneError) console.error("Milestone Error:", milestoneError)
    }

    router.push('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      {/* Navigation Escape Link Block */}
      <div className="mb-6">
        <button 
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          ← Cancel and Go Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Curate a Gift Path</h1>
        
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: The Path Details */}
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">1. Gift Details</h2>
            <input
              type="text"
              required
              placeholder="Who is this for? (e.g. Aarush)"
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={gifteeName}
              onChange={(e) => setGifteeName(e.target.value)}
            />
            <input
              type="text"
              required
              placeholder="Path Title (e.g. Your Journey into Tech)"
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Write a personal welcome message..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Section 2: The Milestones Builder */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">2. Add Milestones (Links & Quotes)</h2>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-800">Milestone {index + 1}</span>
                  <select 
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900"
                    value={milestone.content_type}
                    onChange={(e) => updateMilestone(index, 'content_type', e.target.value as any)}
                  >
                    <option value="video">YouTube Video</option>
                    <option value="book">Book Link</option>
                    <option value="article">Article</option>
                    <option value="quote">Personal Quote</option>
                    <option value="audio">🎙️ Voice Note</option>
                  </select>
                </div>
                
                {/* Conditional Input Selection Block */}
                {milestone.content_type === 'audio' ? (
                  <AudioRecorder 
                    onUploadComplete={(publicUrl) => {
                      updateMilestone(index, 'url', publicUrl)
                      updateMilestone(index, 'title', 'Personal Voice Note')
                      updateMilestone(index, 'description', 'Click play below to hear a custom voice memo recorded especially for you.')
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={milestone.content_type === 'quote' ? "Enter your quote here..." : "Paste a URL here..."}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={milestone.url}
                    onChange={(e) => updateMilestone(index, 'url', e.target.value)}
                    onBlur={(e) => handleScrape(index, e.target.value)}
                  />
                )}

                {/* The Preview Card */}
                {milestone.title && milestone.content_type !== 'audio' && (
                  <div className="flex items-center gap-4 mt-2 p-3 bg-white rounded border border-gray-200">
                    {milestone.image_url && (
                      <img src={milestone.image_url} alt="preview" className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm line-clamp-1 text-gray-900">{milestone.title}</span>
                      <span className="text-xs text-gray-500 line-clamp-2">{milestone.description}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMilestone}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              + Add a Milestone
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Saving Path...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}