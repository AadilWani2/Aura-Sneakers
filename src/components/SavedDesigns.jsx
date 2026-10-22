import { Bookmark, Trash2, RotateCcw } from 'lucide-react'

export default function SavedDesigns({ designs, onLoad, onDelete }) {
  if (!designs.length) {
    return (
      <section className="mt-6 border border-white/10 bg-[#151513] p-5">
        <div className="flex items-center gap-2 text-white/70">
          <Bookmark size={16} />
          <h3 className="text-xs uppercase tracking-[0.16em]">
            Your saved designs
          </h3>
        </div>
        <p className="mt-3 text-sm text-white/40">
          Your custom colourways will appear here when you save them.
        </p>
      </section>
    )
  }

  return (
    <section className="mt-6 border border-white/10 bg-[#151513] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <Bookmark size={16} />
          <h3 className="text-xs uppercase tracking-[0.16em]">
            Your saved designs
          </h3>
        </div>
        <span className="text-[10px] text-white/40">
          {designs.length} saved
        </span>
      </div>

      <div className="space-y-3">
        {designs.map((design) => (
          <div
            key={design.id}
            className="flex items-center gap-3 border border-white/10 p-3"
          >
            <div className="flex shrink-0 gap-1">
              {Object.entries(design.colors).map(([part, color]) => (
                <span
                  key={part}
                  title={`${part}: ${color}`}
                  className="h-5 w-5 rounded-full border border-white/15"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-white/80">
                {design.name}
              </p>
              <p className="mt-1 text-[10px] text-white/35">
                {new Date(design.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onLoad(design)}
              title="Load design"
              aria-label={`Load ${design.name}`}
              className="p-2 text-white/50 transition hover:text-[#d8ff3e]"
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(design.id)}
              title="Delete design"
              aria-label={`Delete ${design.name}`}
              className="p-2 text-white/40 transition hover:text-red-400"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
