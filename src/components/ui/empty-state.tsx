export function EmptyState({ title, description, showCreateButton }: { title: string; description?: string; showCreateButton?: boolean }) {
  return (
    <div className="rounded-lg border bg-white py-16 text-center">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description ? <p className="mt-2 text-gray-600">{description}</p> : null}
      {showCreateButton ? (
        <div className="mt-6">
          <button className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Create prompt</button>
        </div>
      ) : null}
    </div>
  )
}
