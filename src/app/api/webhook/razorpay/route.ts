// Find: if (payload.event === 'payment.captured') inside src/app/api/webhook/razorpay/route.ts
// Replace that processing block cleanly with this entry engine:

if (payload.event === 'payment.captured') {
  const pathId = payload.payload.payment.entity.notes?.path_id
  const baseBudgetPaise = Number(payload.payload.payment.entity.notes?.base_budget) || 0

  if (pathId) {
    // 1. Mark path execution layout state to active public status
    await supabaseAdmin
      .from('paths')
      .update({ is_paid: true })
      .eq('id', pathId)

    -- 2. Log entry mapping fund insertion directly into system escrow pool structures
    if (baseBudgetPaise > 0) {
      await supabaseAdmin
        .from('financial_ledgers')
        .insert([{
          path_id: pathId,
          source_account: 'gifter_wallet',
          destination_account: 'system_escrow_holding',
          transaction_type: 'escrow_funding',
          amount_paise: baseBudgetPaise
        }])
    }
  }
}