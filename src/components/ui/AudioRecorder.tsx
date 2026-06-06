'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type AudioRecorderProps = {
  onUploadComplete: (url: string) => void;
}

export default function AudioRecorder({ onUploadComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const startRecording = async () => {
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const playbackUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(playbackUrl)
        
        await uploadAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access denied or unsupported:', err)
      alert('Could not access microphone.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const uploadAudio = async (blob: Blob) => {
    setUploading(true)
    try {
      const fileName = `${Math.random().toString(36).substring(2)}.webm`
      const filePath = `voice-notes/${fileName}`

      const { data, error } = await supabase.storage
        .from('milestone-audio')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('milestone-audio')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (err) {
      console.error('Audio upload failed:', err)
      alert('Failed to upload voice note.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Voice Note Recorder</span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-black text-red-600 animate-pulse uppercase">
            <span className="w-2 h-2 rounded-full bg-red-600" /> Recording...
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            🎙️ Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Stop & Save
          </button>
        )}

        {audioUrl && !isRecording && (
          <audio src={audioUrl} controls className="h-8 max-w-full" />
        )}

        {uploading && (
          <span className="text-xs text-gray-400 font-medium animate-pulse">
            Uploading clip...
          </span>
        )}
      </div>
    </div>
  )
}