{/* Inside src/app/dashboard/page.tsx -> find the action footer panel button area */}
<div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
  <Link
    href={`/path/${path.id}`}
    className="flex-1 text-center py-2 px-4 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
  >
    {path.is_paid ? 'Manage & Track' : 'Preview Roadmap'}
  </Link>
  
  {/* Additive Support: Allow Gifters to modify an unpaid draft path */}
  {!path.is_paid && (
    <Link
      href={`/dashboard/create?edit=${path.id}`}
      className="text-center py-2 px-4 rounded-lg border border-indigo-200 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
    >
      ✏️ Edit
    </Link>
  )}
  
  {path.is_paid ? (
    <ShareButton pathId={path.id} isPaid={path.is_paid} />
  ) : (
    <PaymentButton pathId={path.id} />
  )}
</div>