'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import AudioRecorder from '@/components/ui/AudioRecorder'

type Milestone = {
  id: string;
  content_type: 'video' | 'book' | 'article' | 'quote' | 'audio';
  url: string;
  title: string;
  description: string;
  image_url: string;
  reward_amount_paise: number;
  expected_proof_criteria: string;
}

export default function CreatePathPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editPathId = searchParams.get('edit') // Checks if we are in Edit Mode
  const supabase = createClient()
  
  // Path State
  const [gifteeName, setGifteeName] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [totalBudgetRupees, setTotalBudgetRupees] = useState('0')
  
  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Hydrate form if we are in Edit Mode
  useEffect(() => {
    if (!editPathId) return

    async function loadPathForEditing() {
      setFetchingData(true)
      
      // 1. Fetch Path Details
      const { data: path, error: pathError } = await supabase
        .from('paths')
        .select('*')
        .eq('id', editPathId)
        .single()

      if (pathError || !path) {
        alert('Could not find the requested path for editing.')
        router.push('/dashboard')
        return
      }

      setGifteeName(path.giftee_name)
      setTitle(path.title)
      setMessage(path.personal_message || '')
      setTotalBudgetRupees(String((path.total_gift_amount_paise || 0) / 100))

      // 2. Fetch Existing Milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('path_id', editPathId)
        .order('display_order', { ascending: true })

      if (milestonesData) {
        setMilestones(milestonesData.map((m: any) => ({
          id: m.id, // Keeps real DB UUID intact for upserting
          content_type: m.content_type,
          url: m.url || '',
          title: m.title || '',
          description: m.description || '',
          image_url: m.image_url || '',
          reward_amount_paise: m.reward_amount_paise || 0,
          expected_proof_criteria: m.expected_proof_criteria || ''
        })))
      }
      setFetchingData(false)
    }

    loadPathForEditing()
  }, [editPathId, supabase, router])

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Math.random().toString(36).substring(7), // Temp ID for new items
      content_type: 'video',
      url: '',
      title: '',
      description: '',
      image_url: '',
      reward_amount_paise: 0,
      expected_proof_criteria: 'Provide screenshot or link proof of completion.'
    }])
  }

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index)
    setMilestones(updated)
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const newMilestones = [...milestones]
    ;(newMilestones[index] as any)[field] = value
    setMilestones(newMilestones)
  }

  const generateAIPathBlueprint = async () => {
    if (!title) {
      alert('Please enter a Path Title or Topic first so the AI can analyze the goal context.')
      return
    }
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: title, budget_rupees: Number(totalBudgetRupees) || 1000 })
      })
      const json = await res.json()
      if (json.success && json.blueprint) {
        const generated: Milestone[] = json.blueprint.milestones.map((m: any) => ({
          id: Math.random().toString(36).substring(7),
          content_type: 'article',
          url: '',
          title: m.title,
          description: m.description,
          image_url: '',
          reward_amount_paise: m.reward_amount_paise,
          expected_proof_criteria: m.expected_proof_criteria
        }))
        setMilestones(generated)
      }
    } catch (err) {
      console.error(err)
      alert('AI Generation encountered an error.')
    } finally {
      setAiGenerating(false)
    }
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

    let pathId = editPathId

    // 1. Insert or Update the Path details
    if (editPathId) {
      const { error: pathUpdateError } = await supabase
        .from('paths')
        .update({ 
          giftee_name: gifteeName, 
          title, 
          personal_message: message,
          total_gift_amount_paise: (Number(totalBudgetRupees) || 0) * 100
        })
        .eq('id', editPathId)

      if (pathUpdateError) {
        console.error(pathUpdateError)
        setLoading(false)
        return
      }
    } else {
      const { data: pathData, error: pathError } = await supabase
        .from('paths')
        .insert([{ 
          creator_id: user.id, 
          giftee_name: gifteeName, 
          title, 
          personal_message: message,
          total_gift_amount_paise: (Number(totalBudgetRupees) || 0) * 100
        }])
        .select()
        .single()

      if (pathError) {
        console.error(pathError)
        setLoading(false)
        return
      }
      pathId = pathData.id
    }

    // 2. Clean clear and replace milestones to maintain sequence index integrity
    if (editPathId) {
      await supabase.from('milestones').delete().eq('path_id', editPathId)
    }

    if (milestones.length > 0 && pathId) {
      const milestonesToInsert = milestones.map((m, i) => ({
        path_id: pathId,
        content_type: m.content_type,
        url: m.url,
        title: m.title,
        description: m.description,
        image_url: m.image_url,
        display_order: i,
        reward_amount_paise: m.reward_amount_paise,
        expected_proof_criteria: m.expected_proof_criteria
      }))

      const { error: milestoneError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert)

      if (milestoneError) console.error("Milestone Error:", milestoneError)
    }

    router.push('/dashboard')
  }

  if (fetchingData) {
    return <div className="p-8 text-center text-sm font-bold text-gray-400 animate-pulse">Retrieving roadmap details...</div>
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{editPathId ? 'Edit Discovery Path' : 'Curate a Gift Path'}</h1>
          {!editPathId && (
            <button
              type="button"
              onClick={generateAIPathBlueprint}
              disabled={aiGenerating}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-4 py-2.5 rounded-lg border border-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {aiGenerating ? '🤖 Architecting Blueprint...' : '🤖 Generate Roadmap using AI'}
            </button>
          )}
        </div>
        
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: The Path Details */}
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">1. Gift Details</h2>
            <input
              type="text"
              required
              placeholder="Who is this for? (e.g. Aarush)"
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              value={gifteeName}
              onChange={(e) => setGifteeName(e.target.value)}
            />
            <input
              type="text"
              required
              placeholder="Path Title (e.g. Learn Python Programming)"
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              placeholder="Total Journey Reward Budget Pool (in ₹ INR)"
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              value={totalBudgetRupees}
              onChange={(e) => setTotalBudgetRupees(e.target.value)}
            />
            <textarea
              placeholder="Write a personal welcome message..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Section 2: The Milestones Builder */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">2. Edit Milestones (Links & Rewards)</h2>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-800">Milestone {index + 1}</span>
                  <div className="flex items-center gap-3">
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
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove Milestone"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Milestone Payout (in ₹ INR)"
                    className="rounded-md border border-gray-300 px-4 py-1.5 bg-white text-gray-900 text-xs focus:outline-none"
                    value={milestone.reward_amount_paise ? milestone.reward_amount_paise / 100 : ''}
                    onChange={(e) => updateMilestone(index, 'reward_amount_paise', (Number(e.target.value) || 0) * 100)}
                  />
                  <input
                    type="text"
                    placeholder="What must they submit for proof? (e.g. GitHub link)"
                    className="rounded-md border border-gray-300 px-4 py-1.5 bg-white text-gray-900 text-xs focus:outline-none"
                    value={milestone.expected_proof_criteria}
                    onChange={(e) => updateMilestone(index, 'expected_proof_criteria', e.target.value)}
                  />
                </div>
                
                {milestone.content_type === 'audio' ? (
                  <AudioRecorder 
                    onUploadComplete={(publicUrl) => {
                      updateMilestone(index, 'url', publicUrl)
                      updateMilestone(index, 'title', 'Personal Voice Note')
                      updateMilestone(index, 'description', 'Listen to this audio guide to complete the milestone.')
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={milestone.content_type === 'quote' ? "Enter your quote here..." : "Paste a URL here..."}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
                    value={milestone.url}
                    onChange={(e) => updateMilestone(index, 'url', e.target.value)}
                    onBlur={(e) => handleScrape(index, e.target.value)}
                  />
                )}

                {milestone.title && milestone.content_type !== 'audio' && (
                  <div className="flex items-center gap-4 mt-2 p-3 bg-white rounded border border-gray-200">
                    {milestone.image_url && (
                      <img src={milestone.image_url} alt="preview" className="w-14 h-14 object-cover rounded" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-gray-900 line-clamp-1">{milestone.title}</span>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{milestone.description}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMilestone}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer text-sm"
            >
              + Add a Milestone
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Saving Changes...' : editPathId ? 'Update Discovery Path' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}