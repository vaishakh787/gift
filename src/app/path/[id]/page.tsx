'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'

// Client component wrapper since Phase 2 introduces interactive form submissions on this route
export default function PathViewer({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [path, setPath] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Next.js 16 Client safe parameter unwarpping layout block
  useEffect(() => {
    Promise.resolve(params).then((unwrapped) => setId(unwrapped.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    async function hydrateTimelineState() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: pathData, error: pathError } = await supabase
        .from('paths')
        .select('*')
        .eq('id', id)
        .single()

      if (pathError || !pathData) {
        setLoading(false)
        return
      }
      setPath(pathData)

      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('path_id', id)
        .order('display_order', { ascending: true })

      setMilestones(milestonesData || [])
      setLoading(false)
    }

    hydrateTimelineState()
  }, [id, supabase])

  if (loading) {
    return <div className="p-8 text-center text-sm font-bold text-gray-400 animate-pulse">Loading interactive discovery pipeline...</div>
  }

  if (!path) {
    if (!user) return <LockedPaywallScreen id={id || ''} />
    return notFound()
  }

  const isCreator = user && path.creator_id === user.id
  if (!path.is_paid && !isCreator) {
    return <LockedPaywallScreen id={id || ''} />
  }

  async function deletePath() {
    const confirmDelete = window.confirm("Are you sure you want to completely remove this digital discovery journey?")
    if (!confirmDelete) return

    await supabase.from('milestones').delete().eq('path_id', path.id)
    await supabase.from('paths').delete().eq('id', path.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-32">
      {/* Top Navigation & Action Row */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        {isCreator && (
          <div className="flex items-center gap-3">
            <button
              onClick={deletePath}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Delete Path
            </button>
          </div>
        )}
      </div>

      {/* Admin Draft Banner Notice */}
      {!path.is_paid && isCreator && (
        <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-3 px-4 text-sm font-bold tracking-wide shadow-inner flex items-center justify-center gap-2">
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
                  {isEven && <TimelineCard milestone={milestone} isPaid={path.is_paid} isCreator={isCreator} />}
                </div>
                <div className={`w-full md:w-1/2 pl-12 md:px-12 mt-8 md:mt-0 ${!isEven ? 'md:pl-12' : 'md:hidden'}`}>
                  {!isEven && <TimelineCard milestone={milestone} isPaid={path.is_paid} isCreator={isCreator} />}
                </div>
                <div className="w-full pl-16 pr-4 md:hidden">
                   <TimelineCard milestone={milestone} isPaid={path.is_paid} isCreator={isCreator} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

function ProofSubmissionWidget({ 
  milestoneId, 
  onSubmissionSuccess 
}: { 
  milestoneId: string; 
  onSubmissionSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClient()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please select a valid image or screenshot file.')

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `proofs/${milestoneId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('milestone-proofs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('milestone-proofs')
        .getPublicUrl(filePath)

      const res = await fetch(`/api/validate/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_id: milestoneId, // Explicitly mappings context to verification pipeline endpoints
          uploaded_asset_url: publicUrl
        })
      })

      const json = await res.json()
      if (json.success) {
        alert(`Proof processed successfully! Status: ${json.status} (Score: ${json.score}%)`)
        onSubmissionSuccess()
      } else {
        alert(`Verification exception trace notice: ${json.error}`)
      }
    } catch (err: any) {
      console.error(err)
      alert('Asset ingestion pipeline transaction crash.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl space-y-3 m-0">
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Upload Execution Proof</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
        />
      </div>
      <button
        type="submit"
        disabled={uploading || !file}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 text-xs rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
      >
        {uploading ? 'Piping through Computer Vision...' : 'Submit Verification Asset'}
      </button>
    </form>
  )
}

function LockedPaywallScreen({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center px-4 selection:bg-indigo-500/30">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-indigo-500/20">🔒</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">A Journey Awaits...</h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          A beautiful curated digital discovery path has been prepared for someone special, but it hasn't been completely published by the creator yet.
        </p>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/30 text-xs font-mono text-indigo-400 break-all mb-4">
          Path ID: {id.substring(0, 8)}...
        </div>
      </div>
    </div>
  )
}

function TimelineCard({ milestone, isPaid, isCreator }: { milestone: any; isPaid: boolean; isCreator: boolean }) {
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (milestone.content_type === 'audio') {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
        
        <div className="flex justify-between items-start mb-4 gap-2">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-purple-50 text-purple-600 border border-purple-100">
            🎙️ Voice Note
          </span>
          {milestone.reward_amount_paise > 0 && (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-md shadow-inner">
              Payout: ₹{milestone.reward_amount_paise / 100}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {milestone.title || 'Voice Guidance'}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4">
          {milestone.description}
        </p>

        {milestone.url ? (
          <div className="mt-4 p-2 bg-purple-50/40 border border-purple-100 rounded-xl shadow-inner">
            <audio src={milestone.url} controls className="w-full h-10 focus:outline-none" />
          </div>
        ) : (
          <p className="text-xs text-red-500 italic">No audio recorded for this section.</p>
        )}

        {milestone.expected_proof_criteria && milestone.expected_proof_criteria !== 'No evaluation criteria provided.' && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Verification Goal:</strong> {milestone.expected_proof_criteria}
          </div>
        )}

        {isPaid && !milestone.is_completed && !isCreator && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <ProofSubmissionWidget milestoneId={milestone.id} onSubmissionSuccess={() => window.location.reload()} />
          </div>
        )}

        {milestone.is_completed && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
            <span className="text-emerald-600 font-bold text-sm">✅ Verified Achievement Unlocked</span>
          </div>
        )}
      </div>
    );
  }

  if (milestone.content_type === 'quote') {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl shadow-md border border-slate-800 text-left relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute -top-4 -left-2 text-8xl text-indigo-700/30 font-serif pointer-events-none select-none">“</div>
        <blockquote className="relative z-10">
          <p className="text-xl md:text-2xl text-indigo-100 font-medium italic leading-relaxed mb-4">
            {milestone.url || 'No quote text provided yet.'}
          </p>
          <footer className="text-sm font-bold tracking-wider text-indigo-400 flex justify-between items-center uppercase">
            <span>— Words of Wisdom</span>
            {milestone.reward_amount_paise > 0 && (
              <span className="bg-white/10 text-white text-xs font-black px-2 py-0.5 rounded">
                ₹{milestone.reward_amount_paise / 100}
              </span>
            )}
          </footer>
        </blockquote>

        {isPaid && !milestone.is_completed && !isCreator && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <ProofSubmissionWidget milestoneId={milestone.id} onSubmissionSuccess={() => window.location.reload()} />
          </div>
        )}

        {milestone.is_completed && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl">
            <span className="text-emerald-400 font-bold text-sm">✅ Verified Achievement Unlocked</span>
          </div>
        )}
      </div>
    );
  }

  const videoId = milestone.content_type === 'video' ? getYouTubeId(milestone.url) : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4 gap-2">
        <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
          milestone.content_type === 'video' ? 'bg-red-50 text-red-600 border border-red-100' :
          milestone.content_type === 'book' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {milestone.content_type === 'video' ? '📹 Video' : milestone.content_type === 'book' ? '📚 Book' : '📰 Article'}
        </span>
        {milestone.reward_amount_paise > 0 && (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-md shadow-inner">
            Payout: ₹{milestone.reward_amount_paise / 100}
          </span>
        )}
      </div>
      
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
            <img src={milestone.image_url} alt="preview" className="w-full h-48 object-cover transform group-hover:scale-102 transition-transform duration-500" />
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

      {milestone.expected_proof_criteria && milestone.expected_proof_criteria !== 'No evaluation criteria provided.' && (
        <div className="my-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Verification Goal:</strong> {milestone.expected_proof_criteria}
        </div>
      )}
      
      {milestone.url && (
        <a href={milestone.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-bold tracking-wide mt-2">
          Open Material 
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}

      {isPaid && !milestone.is_completed && !isCreator && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <ProofSubmissionWidget milestoneId={milestone.id} onSubmissionSuccess={() => window.location.reload()} />
        </div>
      )}

      {milestone.is_completed && (
        <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
          <span className="text-emerald-600 font-bold text-sm">✅ Verified Achievement Unlocked</span>
        </div>
      )}
    </div>
  );
}