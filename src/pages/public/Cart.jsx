import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package } from 'lucide-react'

function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-neutral-300 dark:text-gray-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-black dark:text-white uppercase tracking-wide mb-2">Tu carrito está vacío</h1>
          <p className="text-neutral-400 dark:text-gray-500 mb-8">Agrega productos industriales para comenzar tu cotización</p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            <Package className="w-4 h-4" />
            Explorar productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-black dark:text-white uppercase tracking-wide">
          Carrito de compras
        </h1>
        <Link
          to="/productos"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-neutral-400 dark:text-gray-500 hover:text-primary-500 transition-colors font-medium"
        >
          <Package className="w-4 h-4" />
          Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 p-4 sm:p-5 flex items-start gap-4 hover:shadow-lg dark:hover:shadow-gray-900 hover:border-neutral-200 dark:hover:border-gray-600 transition-all duration-300"
            >
              <div className="bg-neutral-100 dark:bg-gray-700 rounded-xl w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {item.category && (
                      <p className="text-[11px] font-semibold text-neutral-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                        {item.category}
                      </p>
                    )}
                    <Link
                      to={`/productos/${item.id}`}
                      className="font-heading text-sm sm:text-base font-bold text-neutral-800 dark:text-gray-200 hover:text-primary-500 transition-colors uppercase tracking-wide line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-neutral-400 dark:text-gray-500 mt-0.5">
                      ${item.price.toFixed(2)} c/u
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Eliminar producto"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-100 dark:border-gray-700">
                  <div className="flex items-center gap-1 bg-neutral-50 dark:bg-gray-700 rounded-lg border border-neutral-200 dark:border-gray-600 overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-neutral-500 dark:text-gray-400 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600 transition-colors"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-neutral-800 dark:text-gray-200 select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const max = item.stock ?? Infinity
                        if (item.quantity < max) updateQuantity(item.id, item.quantity + 1)
                      }}
                      className="w-9 h-9 flex items-center justify-center text-neutral-500 dark:text-gray-400 hover:text-primary-500 hover:bg-white dark:hover:bg-gray-600 transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 p-6 lg:sticky lg:top-28">
            <h2 className="font-heading text-lg font-bold text-black dark:text-white uppercase tracking-wide mb-5">
              Resumen
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-500 dark:text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} productos)</span>
                <span className="text-neutral-800 dark:text-gray-200 font-medium">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 dark:border-gray-700 mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-heading text-base font-bold text-black dark:text-white uppercase tracking-wide">Total</span>
              <span className="text-xl font-bold text-primary-500">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-2">Precio con IVA INCLUIDO</p>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] mt-6"
            >
              Proceder al pago
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/productos"
              className="sm:hidden flex items-center justify-center gap-1.5 text-sm text-neutral-400 dark:text-gray-500 hover:text-primary-500 transition-colors font-medium mt-4"
            >
              <Package className="w-4 h-4" />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
