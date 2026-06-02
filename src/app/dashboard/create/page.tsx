import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreatePathPage() {
  // This is a Next.js Server Action. It runs securely on the backend.
  const createPath = async (formData: FormData) => {
    'use server'
    
    const supabase = createClient()
    
    // Verify the user is logged in before allowing database writes
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const gifteeName = formData.get('gifteeName') as string
    const title = formData.get('title') as string
    const personalMessage = formData.get('personalMessage') as string

    // Insert the data into our Postgres table
    const { error } = await supabase
      .from('paths')
      .insert([
        {
          creator_id: user.id,
          giftee_name: gifteeName,
          title: title,
          personal_message: personalMessage,
        }
      ])

    if (error) {
      console.error('Database Error:', error.message)
      // In a production app you'd handle this with React state, 
      // but for a hackathon sprint, we log it and proceed.
      return
    } 
    
    // If successful, redirect the user back to the main dashboard
    redirect(`/dashboard`) 
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Gift Path</h1>
      
      <form action={createPath} className="space-y-6">
        <div>
          <label htmlFor="gifteeName" className="block text-sm font-medium text-gray-700">
            Who is this gift for? (Giftee Name)
          </label>
          <input
            type="text"
            id="gifteeName"
            name="gifteeName"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Aarush"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Path Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Your Path to Tech Innovation"
          />
        </div>

        <div>
          <label htmlFor="personalMessage" className="block text-sm font-medium text-gray-700">
            Personal Message
          </label>
          <textarea
            id="personalMessage"
            name="personalMessage"
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Write a nice note to the giftee..."
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Initialize Gift Path
        </button>
      </form>
    </div>
  )
}