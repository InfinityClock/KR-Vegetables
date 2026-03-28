export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4">{icon || '🌿'}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mb-6 max-w-xs">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#2D6A4F] text-white rounded-xl font-semibold text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
