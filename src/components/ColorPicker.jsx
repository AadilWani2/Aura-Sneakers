import { useState } from 'react'
import { Pipette, RotateCcw } from 'lucide-react'

const quickColors = [
  '#FFFFFF', '#E8E4DC', '#BDA58A', '#8B7355',
  '#202124', '#111111', '#C92F42', '#F97316',
  '#D8FF3E', '#84CC16', '#3158D8', '#7C3AED',
  '#EC4899', '#38BDF8', '#14B8A6', '#A1A1AA',
]

export default function ColorPicker({ color, onChange, onReset }) {
  const [hexInput, setHexInput] = useState(color)
  const [pickerOpen, setPickerOpen] = useState(false)

  const updateColor = (value) => {
    setHexInput(value.toUpperCase())
    onChange(value.toUpperCase())
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
          Colours
        </p>

        <button
          type="button"
          onClick={() => {
            onReset()
            setHexInput('#FFFFFF')
          }}
          className="flex items-center gap-1.5 text-[10px] text-white/40 transition hover:text-white"
        >
          <RotateCcw size={11} />
          Reset part
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {quickColors.map((swatch) => (
          <button
            key={swatch}
            type="button"
            title={swatch}
            aria-label={`Choose ${swatch}`}
            aria-pressed={color.toUpperCase() === swatch}
            onClick={() => {
              setHexInput(swatch)
              onChange(swatch)
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
              color.toUpperCase() === swatch
                ? 'border-[#d8ff3e] ring-1 ring-[#d8ff3e]/40'
                : 'border-white/15 hover:border-white/70'
            }`}
          >
            <span
              className="h-5 w-5 rounded-full border border-black/10"
              style={{ backgroundColor: swatch }}
            />
          </button>
        ))}

        <div className="relative">
          <button
            type="button"
            title="Choose a custom colour"
            aria-label="Choose a custom colour"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white/65 transition hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
          >
            <Pipette size={13} />
          </button>

          {pickerOpen && (
            <div className="absolute right-0 top-9 z-30 w-56 rounded-lg border border-white/15 bg-[#191917] p-3 shadow-xl">
              <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-white/50">
                Custom colour
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick custom colour"
                  value={color}
                  onChange={(event) => updateColor(event.target.value)}
                  className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                />

                <input
                  type="text"
                  aria-label="Custom HEX colour"
                  value={hexInput}
                  maxLength={7}
                  placeholder="#D8FF3E"
                  spellCheck={false}
                  onChange={(event) => {
                    const value = event.target.value.toUpperCase()
                    setHexInput(value)

                    if (/^#[0-9A-F]{6}$/.test(value)) {
                      onChange(value)
                    }
                  }}
                  onBlur={() => setHexInput(color.toUpperCase())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur()
                    }
                  }}
                  className="min-w-0 flex-1 border-b border-white/20 bg-transparent py-1 text-xs text-white outline-none focus:border-[#d8ff3e]"
                />
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="mt-3 w-full bg-[#d8ff3e] py-2 text-[10px] font-bold uppercase tracking-wider text-[#10100f] transition hover:bg-white"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}