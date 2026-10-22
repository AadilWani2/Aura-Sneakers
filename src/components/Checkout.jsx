import { useState } from 'react'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'

export default function Checkout({ items, onBack, onPlaceOrder }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })

  const [errors, setErrors] = useState({})

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) nextErrors[key] = 'This field is required'
    })

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number'
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      nextErrors.pincode = 'Enter a valid 6-digit PIN code'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      onPlaceOrder({
        customer: form,
        items,
        total,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const fieldClass =
    'mt-2 w-full border border-white/15 bg-[#111110] px-4 py-3 text-sm text-white outline-none transition placeholder/25 focus:border-[#d8ff3e]'

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#10100f]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-white/55 transition hover:text-[#d8ff3e]"
        >
          <ArrowLeft size={15} />
          Back to shopping bag
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#d8ff3e]">
              AURA / Checkout
            </p>
            <h1 className="mt-3 font-['Syne'] text-4xl font-bold sm:text-5xl">
              Your details<span className="text-[#d8ff3e]">.</span>
            </h1>
            <p className="mt-3 text-sm text-white/45">
              Enter your delivery information to review your order.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-xs text-white/65">Full name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your full name"
                  className={fieldClass}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-white/65">Email address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/65">Mobile number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    className={fieldClass}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/65">Delivery address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="House number, street, locality"
                  rows={3}
                  className={fieldClass}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-400">{errors.address}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-white/65">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="City"
                    className={fieldClass}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-400">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-white/65">PIN code</label>
                  <input
                    inputMode="numeric"
                    name="pincode"
                    value={form.pincode}
                    onChange={updateField}
                    placeholder="6-digit PIN code"
                    className={fieldClass}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs text-red-400">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 bg-[#d8ff3e] px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#10100f] transition hover:bg-white"
              >
                Review order
                <ArrowRight size={16} />
              </button>
            </form>
          </section>

          <aside className="h-fit border border-white/10 bg-[#171715] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-[#d8ff3e]" />
              <h2 className="text-xs uppercase tracking-[0.18em]">Order summary</h2>
            </div>

            <div className="mt-6 space-y-5">
              {items.map((item) => (
                <div
                  key={item.key || item.id}
                  className="flex justify-between gap-4 border-b border-white/10 pb-5"
                >
                  <div>
                    <p className="text-sm">{item.name}</p>
                    <p className="mt-1 text-xs text-white/40">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between text-sm text-white/55">
              <span>Shipping</span>
              <span>Calculated at confirmation</span>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
              <span className="text-xs uppercase tracking-wider">Subtotal</span>
              <span className="font-['Syne'] text-2xl font-bold">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="mt-5 text-xs leading-5 text-white/35">
              This is a frontend checkout demo. No payment will be collected and no order is sent to a server yet.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
