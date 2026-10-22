import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  X,
  Bookmark,
  Share2,
} from 'lucide-react'
import SneakerScene from './components/SneakerScene'
import SneakerGallery from './components/SneakerGallery'
import ColorPicker from './components/ColorPicker'
import SavedDesigns from './components/SavedDesigns'
import Checkout from './components/Checkout'
import OrderConfirmation from './components/OrderConfirmation'

const parts = [
  { key: 'upper', name: 'Upper' },
  { key: 'laces', name: 'Laces' },
  { key: 'sole', name: 'Sole' },
  { key: 'tongue', name: 'Tongue' },
  { key: 'heel', name: 'Heel' },
]

const palette = [
  { name: 'Ivory', value: '#e8e4dc' },
  { name: 'Black', value: '#202124' },
  { name: 'Red', value: '#c92f42' },
  { name: 'Lime', value: '#d8ff3e' },
  { name: 'Blue', value: '#3158d8' },
  { name: 'Sand', value: '#bda58a' },
]

const colorways = [
  {
    key: 'pure',
    name: 'Pure',
    description: 'Clean neutrals',
    colors: {
      upper: '#e8e4dc',
      laces: '#ffffff',
      sole: '#e8e4dc',
      tongue: '#e8e4dc',
      heel: '#e8e4dc',
    },
    swatches: ['#e8e4dc', '#ffffff', '#e8e4dc'],
  },
  {
    key: 'shadow',
    name: 'Shadow',
    description: 'Stealth black',
    colors: {
      upper: '#202124',
      laces: '#202124',
      sole: '#202124',
      tongue: '#202124',
      heel: '#202124',
    },
    swatches: ['#202124', '#383838', '#111111'],
  },
  {
    key: 'signal',
    name: 'Signal',
    description: 'Red accents',
    colors: {
      upper: '#e8e4dc',
      laces: '#c92f42',
      sole: '#202124',
      tongue: '#e8e4dc',
      heel: '#c92f42',
    },
    swatches: ['#e8e4dc', '#c92f42', '#202124'],
  },
  {
    key: 'voltage',
    name: 'Voltage',
    description: 'Lime accents',
    colors: {
      upper: '#e8e4dc',
      laces: '#d8ff3e',
      sole: '#202124',
      tongue: '#e8e4dc',
      heel: '#d8ff3e',
    },
    swatches: ['#e8e4dc', '#d8ff3e', '#202124'],
  },
]

const sizes = [6, 7, 8, 9, 10, 11, 12]

const PRICE = 4999

export default function App() {
  const defaultPartColors = {
    upper: '#ffffff',
    laces: '#ffffff',
    sole: '#ffffff',
    tongue: '#ffffff',
    heel: '#ffffff',
  }

  const [partColors, setPartColors] = useState(defaultPartColors)
  const [introVisible, setIntroVisible] = useState(true)
  const [activePart, setActivePart] = useState('upper')
  const [activeColorway, setActiveColorway] = useState('custom')
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [bagItems, setBagItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura-bag-items') || '[]')
    } catch {
      return []
    }
  })
  const [sizeError, setSizeError] = useState(false)
  const [bagOpen, setBagOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [addedMessage, setAddedMessage] = useState(false)
  const [mobileStudioOpen, setMobileStudioOpen] = useState(false)
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aura-saved-designs') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    const introTimer = window.setTimeout(() => setIntroVisible(false), 1550)
    return () => window.clearTimeout(introTimer)
  }, [])

  useEffect(() => {
    localStorage.setItem('aura-bag-items', JSON.stringify(bagItems))
  }, [bagItems])

  const saveDesign = () => {
    const design = {
      id: Date.now(),
      name: `AURA Design ${savedDesigns.length + 1}`,
      colors: { ...partColors },
      createdAt: new Date().toISOString(),
    }

    const updated = [design, ...savedDesigns].slice(0, 20)

    setSavedDesigns(updated)
    localStorage.setItem('aura-saved-designs', JSON.stringify(updated))
  }

  const shareDesign = async () => {
    const params = new URLSearchParams(partColors)
    const shareUrl = `${window.location.origin}${window.location.pathname}?design=${encodeURIComponent(params.toString())}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      window.alert('Design link copied! Share it with anyone.')
    } catch {
      window.prompt('Copy your design link:', shareUrl)
    }
  }

  const loadSharedDesign = () => {
    const encoded = new URLSearchParams(window.location.search).get('design')
    if (!encoded) return

    try {
      const colors = Object.fromEntries(new URLSearchParams(encoded))
      const allowedParts = ['upper', 'laces', 'sole', 'tongue', 'heel']
      const validHex = /^#[0-9a-fA-F]{6}$/

      const validColors = Object.fromEntries(
        allowedParts
          .filter((part) => validHex.test(colors[part] || ''))
          .map((part) => [part, colors[part]]),
      )

      if (Object.keys(validColors).length) {
        setPartColors((current) => ({ ...current, ...validColors }))
        setActiveColorway('custom')
      }
    } catch {
      // Ignore invalid shared design links.
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(loadSharedDesign)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const bagCount = bagItems.reduce((total, item) => total + item.quantity, 0)

  const bagTotal = bagItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const selectedColor =
    palette.find((color) => color.value === partColors[activePart]) ?? {
      name: 'Custom',
      value: partColors[activePart],
    }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const addToBag = () => {
    if (!selectedSize) {
      setSizeError(true)
      return
    }

    const colorway = Object.entries(partColors)
      .map(([part, color]) => `${part}:${color}`)
      .join('|')

    const itemKey = `${selectedSize}-${colorway}`

    setBagItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.key === itemKey)

      if (existingItem) {
        return currentItems.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          key: itemKey,
          name: 'AURA ONE',
          size: selectedSize,
          price: PRICE,
          quantity,
          colorway,
        },
      ]
    })

    setSizeError(false)
    setAddedMessage(true)
    setBagOpen(true)
  }

  const updateBagQuantity = (key, change) => {
    setBagItems((items) =>
      items
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const loadSavedDesign = (design) => {
    setPartColors({ ...defaultPartColors, ...design.colors })
    setActiveColorway('custom')
    setAddedMessage(false)
  }

  const deleteSavedDesign = (id) => {
    const updated = savedDesigns.filter((design) => design.id !== id)

    setSavedDesigns(updated)
    localStorage.setItem('aura-saved-designs', JSON.stringify(updated))
  }

  return (
    <main className="aura-page min-h-screen overflow-x-hidden bg-[#10100f] pb-24 text-[#f5f3ed] lg:pb-0">
      {introVisible && (
        <div className="aura-intro" role="status" aria-label="Loading AURA Sneakers">
          <div className="aura-intro-mark">AURA<span>.</span></div>
          <div className="aura-intro-caption">DESIGNED TO STAND APART</div>
          <div className="aura-intro-track"><span /></div>
          <div className="aura-intro-bottom"><span>STUDIO 001</span><span>CRAFT YOUR OWN</span></div>
        </div>
      )}
      <header className="aura-header relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 lg:px-12">
        <a
          href="#home"
          className="font-['Syne'] text-xl font-extrabold tracking-[-0.07em]"
        >
          AURA<span className="text-[#d8ff3e]">.</span>
        </a>

        <nav className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.16em] text-white/60 md:flex">
          <a href="#collection" className="transition hover:text-white">
            Collection
          </a>
          <a href="#story" className="transition hover:text-white">
            Our philosophy
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setBagOpen(true)}
          className="flex items-center gap-2 text-xs tracking-wide transition hover:text-[#d8ff3e]"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          Bag ({bagCount})
        </button>
      </header>

      <section
        id="home"
        className="aura-home relative mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8"
      >
        <div className="mb-6 lg:mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-[#d8ff3e]" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">
              Independent sneaker culture
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h1 className="aura-headline font-['Syne'] text-4xl font-bold leading-[0.95] tracking-[-0.065em] sm:text-5xl lg:text-6xl">
              NOT MADE TO <span className="text-[#d8ff3e]">BLEND.</span>
              <br />
              MADE TO BE YOURS<span className="text-[#d8ff3e]">.</span>
            </h1>

            <p className="max-w-sm text-xs leading-5 text-white/55 md:text-right">
              More than a sneaker. A statement of individuality, built for those
              who never needed permission to stand out.
            </p>
          </div>
        </div>

        <div
          id="collection"
          className="grid min-w-0 grid-cols-1 items-start gap-5 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:px-0"
        >
          {/* Left: Interactive 3D sneaker & gallery */}
          <div className="min-w-0">
            <div className="aura-stage relative h-[300px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.015] sm:h-[380px] lg:sticky lg:top-6 lg:h-[460px]">
              {!mobileStudioOpen && <SneakerScene partColors={partColors} />}

              <div className="pointer-events-none absolute bottom-4 left-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                  AURA ONE / 001
                </p>
                <p className="mt-1 text-[10px] text-white/25">
                  Interactive 3D preview
                </p>
              </div>

              <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8ff3e]" />
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/45">
                  Live customizer
                </span>
              </div>
            </div>

            <SneakerGallery partColors={partColors} />

            <SavedDesigns
              designs={savedDesigns}
              onLoad={loadSavedDesign}
              onDelete={deleteSavedDesign}
            />
          </div>

          {/* Right: Product details and customizer */}
          <div id="product-customizer" className="hidden min-w-0 space-y-4 lg:block">
            <div className="border-b border-white/10 pb-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#d8ff3e]">
                  New release / 001
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Lifestyle sneaker
                </p>
              </div>

              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-['Syne'] text-3xl font-bold tracking-[-0.055em] sm:text-4xl lg:text-5xl">
                    AURA ONE
                  </h2>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-white/50">
                    Your everyday essential. Customise the details and make
                    this pair your own.
                  </p>
                </div>

                <p className="shrink-0 pt-1 text-2xl font-medium sm:text-3xl">
                  ₹{PRICE.toLocaleString('en-IN')}
                </p>
              </div>
              <p className="mt-3 text-[10px] text-white/35">
                Demo price · Shipping calculated at checkout
              </p>
            </div>

            {/* Customise colours */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Customise your pair
                </p>
                <p className="text-xs text-white/40">{selectedColor.name}</p>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Signature colourways
                </p>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {colorways.map((colorway) => {
                    const isActive = activeColorway === colorway.key

                    return (
                      <button
                        key={colorway.key}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => {
                          setPartColors({ ...colorway.colors })
                          setActiveColorway(colorway.key)
                          setAddedMessage(false)
                        }}
                        className={`flex shrink-0 items-center gap-3 border p-3 text-left transition ${
                          isActive
                            ? 'border-[#d8ff3e] bg-[#d8ff3e]/[0.04]'
                            : 'border-white/10 hover:border-white/40'
                        }`}
                      >
                        <div className="flex shrink-0 -space-x-1">
                          {colorway.swatches.map((swatch, index) => (
                            <span
                              key={`${colorway.key}-${index}`}
                              className="h-5 w-5 rounded-full border border-[#10100f]"
                              style={{ backgroundColor: swatch }}
                            />
                          ))}
                        </div>

                        <span className="min-w-0">
                          <span className="block text-xs font-medium">
                            {colorway.name}
                          </span>
                          <span className="mt-1 block text-[9px] text-white/40">
                            {colorway.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Choose a part
                </p>

                <div className="flex flex-wrap gap-2">
                  {parts.map((part) => (
                    <button
                      key={part.key}
                      type="button"
                      onClick={() => setActivePart(part.key)}
                      className={`border px-3 py-2 text-xs transition ${
                        activePart === part.key
                          ? 'border-[#d8ff3e] text-[#d8ff3e]'
                          : 'border-white/15 text-white/60 hover:border-white/60'
                      }`}
                    >
                      {part.name}
                    </button>
                  ))}
                </div>

                <ColorPicker
                  color={partColors[activePart]}
                  onChange={(color) => {
                    setPartColors((prev) => ({
                      ...prev,
                      [activePart]: color,
                    }))
                    setActiveColorway('custom')
                    setAddedMessage(false)
                  }}
                  onReset={() => {
                    setPartColors((prev) => ({
                      ...prev,
                      [activePart]: defaultPartColors[activePart],
                    }))
                    setActiveColorway('custom')
                    setAddedMessage(false)
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPartColors(defaultPartColors)
                  setActivePart('upper')
                  setActiveColorway('custom')
                  setAddedMessage(false)
                }}
                className="mt-4 text-[10px] uppercase tracking-[0.12em] text-white/40 transition hover:text-white"
              >
                Reset colours
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={saveDesign}
                  className="flex items-center justify-center gap-2 border border-white/15 px-3 py-3 text-[10px] uppercase tracking-wider text-white/70 transition hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
                >
                  <Bookmark size={14} />
                  Save design
                </button>

                <button
                  type="button"
                  onClick={shareDesign}
                  className="flex items-center justify-center gap-2 border border-white/15 px-3 py-3 text-[10px] uppercase tracking-wider text-white/70 transition hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
                >
                  <Share2 size={14} />
                  Share design
                </button>
              </div>
            </div>

            {/* Size selection */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Select your size
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      'Size guide: please check your foot length against a shoe size chart before ordering.',
                    )
                  }
                  className="text-[10px] text-white/40 underline underline-offset-4 transition hover:text-white"
                >
                  Size guide
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selectedSize === size}
                    onClick={() => {
                      setSelectedSize(size)
                      setSizeError(false)
                      setAddedMessage(false)
                    }}
                    className={`flex h-10 items-center justify-center border text-xs transition ${
                      selectedSize === size
                        ? 'border-[#d8ff3e] bg-[#d8ff3e] text-[#10100f]'
                        : 'border-white/15 text-white/70 hover:border-white/60'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-white/35">
                UK sizes · Availability is not connected to live inventory.
              </p>

              {sizeError && (
                <p role="alert" className="mt-3 text-xs text-red-400">
                  Please select a shoe size before adding to your bag.
                </p>
              )}
            </div>

            {/* Quantity and add to bag */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Quantity
                </p>

                <div className="flex items-center border border-white/15">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="p-2.5 text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>

                  <span className="min-w-8 text-center text-xs tabular-nums">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= 10}
                    onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                    className="p-2.5 text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={addToBag}
                className="mt-4 flex w-full items-center justify-center gap-2 bg-[#d8ff3e] px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#10100f] transition hover:bg-white"
              >
                {addedMessage ? <Check size={15} /> : <ShoppingBag size={15} />}
                {addedMessage ? 'Added to bag' : 'Add to bag'}
                <span className="ml-auto">
                  ₹{(PRICE * quantity).toLocaleString('en-IN')}
                </span>
              </button>

              <p className="mt-3 text-center text-[10px] text-white/35">
                Demo storefront · No payment will be taken
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section id="story" className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            The AURA philosophy
          </p>

          <div className="mt-5 grid gap-6 md:grid-cols-2 md:items-end">
            <h2 className="font-['Syne'] text-3xl font-bold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              Different isn't
              <br />
              a trend. It's{' '}
              <span className="text-[#d8ff3e]">an attitude.</span>
            </h2>

            <div className="md:justify-self-end">
              <p className="max-w-md text-sm leading-6 text-white/50">
                We believe what you wear should say something before you do.
                AURA is for the individual and the ones writing their own rules.
              </p>
              <a
                href="#home"
                className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] transition hover:text-[#d8ff3e]"
              >
                Back to the top <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-5 text-[10px] uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:px-8 lg:px-12">
        <span className="font-['Syne'] text-sm font-bold tracking-tight text-white/70">
          AURA SNEAKERS
        </span>
        <span>Independent by design. Different by nature.</span>
        <span>© {new Date().getFullYear()} AURA</span>
      </footer>

      {/* Shopping bag drawer */}
      {bagOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close shopping bag"
            onClick={() => setBagOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#151513] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
              <div>
                <p className="font-['Syne'] text-xl font-bold">Your bag</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">
                  {bagCount} {bagCount === 1 ? 'item' : 'items'}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close shopping bag"
                onClick={() => setBagOpen(false)}
                className="p-2 text-white/60 transition hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {bagItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag size={30} strokeWidth={1} className="text-white/30" />
                  <p className="mt-4 text-sm">Your bag is empty.</p>
                  <p className="mt-2 text-xs text-white/40">
                    Find your pair and make it yours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBagOpen(false)
                      scrollTo('collection')
                    }}
                    className="mt-5 border border-white/20 px-4 py-3 text-[10px] uppercase tracking-[0.12em] transition hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
                  >
                    Explore AURA ONE
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {bagItems.map((item) => (
                    <div
                      key={item.key}
                      className="border-b border-white/10 pb-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-['Syne'] text-lg font-bold">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            UK size {item.size}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            Custom colourway
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setBagItems((items) =>
                              items.filter((entry) => entry.key !== item.key),
                            )
                          }
                          className="text-[10px] text-white/40 underline underline-offset-4 hover:text-white"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-white/15">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => updateBagQuantity(item.key, -1)}
                            className="p-2 text-white/60 hover:text-white"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-7 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => updateBagQuantity(item.key, 1)}
                            className="p-2 text-white/60 hover:text-white"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="text-sm">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {bagItems.length > 0 && (
              <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/55">
                    Subtotal
                  </p>
                  <p className="font-['Syne'] text-xl font-bold">
                    ₹{bagTotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="mt-2 text-[10px] text-white/35">
                  Taxes and shipping are not calculated in this demo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (bagItems.length > 0) setCheckoutOpen(true)
                  }}
                  className="mt-5 w-full bg-[#d8ff3e] px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#10100f] transition hover:bg-white"
                >
                  Proceed to checkout
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Mobile sneaker studio: preview stays visible while controls scroll independently. */}
      {mobileStudioOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[#10100f] lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-['Syne'] text-sm font-extrabold tracking-[-0.05em]">AURA<span className="text-[#d8ff3e]">.</span> STUDIO</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/40">Build your AURA ONE</p>
            </div>
            <button type="button" aria-label="Close sneaker studio" onClick={() => setMobileStudioOpen(false)} className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/70">
              <X size={18} />
            </button>
          </div>

          <div className="relative h-[31dvh] min-h-[190px] shrink-0 border-b border-white/10 bg-white/[0.015]">
            <SneakerScene partColors={partColors} />
            <div className="pointer-events-none absolute bottom-3 left-4">
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/45">AURA ONE / 001</p>
              <p className="mt-1 text-[9px] text-white/30">Drag to rotate · Live preview</p>
            </div>
            <div className="pointer-events-none absolute right-4 top-3 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[9px] uppercase tracking-wider text-white/60">₹{PRICE.toLocaleString('en-IN')}</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-4">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#d8ff3e]">Customise your pair</p>
                <h2 className="mt-1 font-['Syne'] text-2xl font-bold tracking-[-0.06em]">AURA ONE</h2>
              </div>
              <p className="pb-1 text-xs text-white/45">{selectedColor.name}</p>
            </div>

            <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-white/40">Signature colourways</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {colorways.map((colorway) => {
                const isActive = activeColorway === colorway.key
                return (
                  <button key={colorway.key} type="button" aria-pressed={isActive} onClick={() => { setPartColors({ ...colorway.colors }); setActiveColorway(colorway.key); setAddedMessage(false) }} className={`flex shrink-0 items-center gap-2 border px-3 py-2.5 text-left ${isActive ? 'border-[#d8ff3e] bg-[#d8ff3e]/[0.05]' : 'border-white/15'}`}>
                    <span className="flex -space-x-1">{colorway.swatches.map((swatch, index) => <span key={`${colorway.key}-mobile-${index}`} className="h-4 w-4 rounded-full border border-[#10100f]" style={{ backgroundColor: swatch }} />)}</span>
                    <span className="text-[11px]">{colorway.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-white/40">Choose a part</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {parts.map((part) => <button key={part.key} type="button" onClick={() => setActivePart(part.key)} className={`shrink-0 border px-3 py-2 text-[11px] ${activePart === part.key ? 'border-[#d8ff3e] text-[#d8ff3e]' : 'border-white/15 text-white/65'}`}>{part.name}</button>)}
              </div>
              <ColorPicker color={partColors[activePart]} onChange={(color) => { setPartColors((prev) => ({ ...prev, [activePart]: color })); setActiveColorway('custom'); setAddedMessage(false) }} onReset={() => { setPartColors((prev) => ({ ...prev, [activePart]: defaultPartColors[activePart] })); setActiveColorway('custom'); setAddedMessage(false) }} />
              <button type="button" onClick={() => { setPartColors(defaultPartColors); setActivePart('upper'); setActiveColorway('custom'); setAddedMessage(false) }} className="mt-3 text-[9px] uppercase tracking-wider text-white/40 underline underline-offset-4">Reset colours</button>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Select your UK size</p>
                <span className="text-[10px] text-white/35">Required</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {sizes.map((size) => <button key={size} type="button" aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(size); setSizeError(false); setAddedMessage(false) }} className={`flex h-10 items-center justify-center border text-xs ${selectedSize === size ? 'border-[#d8ff3e] bg-[#d8ff3e] text-[#10100f]' : 'border-white/15 text-white/70'}`}>{size}</button>)}
              </div>
              {sizeError && <p role="alert" className="mt-2 text-xs text-red-400">Please select a shoe size first.</p>}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase tracking-wider text-white/55">Quantity</p>
              <div className="flex items-center border border-white/15">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="p-2.5 text-white/70 disabled:opacity-30"><Minus size={13} /></button>
                <span className="min-w-8 text-center text-xs">{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)} className="p-2.5 text-white/70"><Plus size={13} /></button>
              </div>
            </div>

            <button type="button" onClick={() => { if (!selectedSize) { setSizeError(true); return } setMobileStudioOpen(false); addToBag() }} className="mt-4 flex w-full items-center justify-between bg-[#d8ff3e] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#10100f]">
              <span>Add to bag</span><span className="flex items-center gap-2">₹{PRICE.toLocaleString('en-IN')} <ArrowUpRight size={16} /></span>
            </button>
            <p className="mt-2 text-center text-[9px] text-white/30">Custom-built for you · Demo checkout</p>
          </div>
        </div>
      )}

      {/* Mobile-only sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#10100f]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-white/45">
              AURA ONE
            </p>
            <p className="mt-1 text-lg font-semibold">₹4,999</p>
          </div>

          <button
            type="button"
            onClick={() => setMobileStudioOpen(true)}
            className="bg-[#d8ff3e] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#10100f]"
          >
            Customize & buy
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <Checkout
          items={bagItems}
          onBack={() => setCheckoutOpen(false)}
          onPlaceOrder={(order) => {
            setCompletedOrder({
              ...order,
              id: Date.now(),
            })
            setCheckoutOpen(false)
            setBagItems([])
          }}
        />
      )}

      {completedOrder && (
        <OrderConfirmation
          order={completedOrder}
          onContinue={() => setCompletedOrder(null)}
        />
      )}
    </main>
  )
}
