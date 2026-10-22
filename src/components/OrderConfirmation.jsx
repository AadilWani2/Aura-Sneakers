import { Check, ArrowRight, Package, MapPin } from 'lucide-react'

export default function OrderConfirmation({ order, onContinue }) {
  const orderNumber = `AURA-${String(order.id).slice(-8).toUpperCase()}`

  return (
    <main className="fixed inset-0 z-[110] overflow-y-auto bg-[#10100f]">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d8ff3e]/30 bg-[#d8ff3e]/10">
          <Check size={28} className="text-[#d8ff3e]" />
        </div>

        <div className="mt-7 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#d8ff3e]">
            AURA / Order summary
          </p>
          <h1 className="mt-3 font-['Syne'] text-4xl font-bold sm:text-5xl">
            You're all set<span className="text-[#d8ff3e]">.</span>
          </h1>
          <p className="mt-3 text-sm text-white/45">
            Your demo order details are ready for review.
          </p>
          <p className="mt-6 text-xs text-white/40">Order reference</p>
          <p className="mt-1 text-sm tracking-widest">{orderNumber}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="border border-white/10 bg-[#171715] p-5">
            <div className="flex items-center gap-2 text-[#d8ff3e]">
              <MapPin size={16} />
              <h2 className="text-xs uppercase tracking-widest">Delivery details</h2>
            </div>
            <p className="mt-5 text-sm">{order.customer.name}</p>
            <p className="mt-2 text-xs leading-6 text-white/50">
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.pincode}
              <br />
              India
            </p>
            <p className="mt-3 text-xs text-white/40">{order.customer.phone}</p>
            <p className="mt-1 text-xs text-white/40">{order.customer.email}</p>
          </section>

          <section className="border border-white/10 bg-[#171715] p-5">
            <div className="flex items-center gap-2 text-[#d8ff3e]">
              <Package size={16} />
              <h2 className="text-xs uppercase tracking-widest">Order details</h2>
            </div>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.key || item.id} className="flex justify-between gap-3">
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

            <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
              <span className="text-xs uppercase tracking-wider text-white/55">Total</span>
              <span className="font-['Syne'] text-xl font-bold">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </section>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-white/35">
          Demo only — no payment was processed, no shipment was created, and no order was sent to a server.
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mx-auto mt-8 flex items-center justify-center gap-3 bg-[#d8ff3e] px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#10100f] transition hover:bg-white"
        >
          Continue shopping
          <ArrowRight size={16} />
        </button>
      </div>
    </main>
  )
}
