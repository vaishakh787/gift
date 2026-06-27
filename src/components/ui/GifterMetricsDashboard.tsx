'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GifterMetricsDashboard({ pathId }: { pathId: string }) {
  const [metrics, setMetrics] = useState({ funded: 0, disbursed: 0, holding: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchLedgerAggregates() {
      const { data: records } = await supabase
        .from('financial_ledgers')
        .select('transaction_type, amount_paise')
        .eq('path_id', pathId)

      if (records) {
        let funded = 0, disbursed = 0
        records.forEach(row => {
          if (row.transaction_type === 'escrow_funding') funded += Number(row.amount_paise)
          if (row.transaction_type === 'milestone_disbursement') disbursed += Number(row.amount_paise)
        })
        setMetrics({
          funded: funded / 100,
          disbursed: disbursed / 100,
          holding: (funded - disbursed) / 100
        })
      }
    }
    fetchLedgerAggregates()
  }, [pathId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-xs my-6">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Allocated Capital Pool</span>
        <span className="text-xl font-black text-gray-900 mt-1">₹{metrics.funded.toLocaleString()}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Unlocked & Transferred</span>
        <span className="text-xl font-black text-emerald-600 mt-1">₹{metrics.disbursed.toLocaleString()}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Retained Escrow Reservoir</span>
        <span className="text-xl font-black text-indigo-600 mt-1">₹{metrics.holding.toLocaleString()}</span>
      </div>
    </div>
  )
}