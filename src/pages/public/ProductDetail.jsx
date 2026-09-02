import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useQuote } from '../../contexts/QuoteContext'
import { useAuth } from '../../contexts/AuthContext'
import { Check, ShoppingCart, ArrowLeft, ClipboardList, Minus, Plus, FileText } from 'lucide-react'
import { productsApi } from '../../services/api'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { addItem: addQuote } = useQuote()
  const { user } = useAuth()
  const [qty, setQty] = useState(1)
  const [addedQuote, setAddedQuote] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
    productsApi.getById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-neutral-400 dark:text-gray-500 text-lg">Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-600 dark:text-gray-300">Producto no encontrado</h1>
        <Link to="/productos" className="text-primary-500 hover:underline mt-4 inline-block">Volver a productos</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!user) { navigate('/iniciar-sesion'); return }
    addItem({ ...product, id: Number(id) }, qty)
  }

  const handleAddToQuote = () => {
    if (!user) { navigate('/iniciar-sesion'); return }
    addQuote({ ...product, id: Number(id) }, qty)
    setAddedQuote(true)
    setTimeout(() => setAddedQuote(false), 2000)
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex mb-8 text-sm text-neutral-400 dark:text-gray-500">
        <Link to="/" className="hover:text-black dark:hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link to="/productos" className="hover:text-black dark:hover:text-white">Productos</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-600 dark:text-gray-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="bg-neutral-100 dark:bg-gray-800 rounded-2xl w-full max-w-md aspect-square flex items-center justify-center overflow-hidden mb-3">
            <img
              src={productImages[activeImage] || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {productImages.length > 1 && (
            <div className="flex items-center gap-2">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors bg-neutral-100 dark:bg-gray-800 ${
                    i === activeImage
                      ? 'border-primary-500'
                      : 'border-neutral-200 dark:border-gray-600 hover:border-neutral-300 dark:hover:border-gray-500'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-gray-500">
              {product.category}
            </p>
            {product.brand && (
              <>
                <span className="text-neutral-300 dark:text-gray-600">|</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-gray-500">
                  {product.brand}
                </p>
              </>
            )}
          </div>
          <h1 className="font-heading text-4xl font-bold text-black dark:text-white mb-4 uppercase tracking-wide">
            {product.name}
          </h1>
          <p className="text-sm text-neutral-400 dark:text-gray-500 mb-2">SKU: {product.sku}</p>
          {product.price_on_request ? (
            <p className="text-3xl font-bold text-primary-500 dark:text-primary-300 mb-6">
              Consultar precio
            </p>
          ) : (
            <p className="text-3xl font-bold text-black dark:text-white mb-6">
              ${product.price.toFixed(2)}
            </p>
          )}
          <p className="text-neutral-600 dark:text-gray-300 mb-6 leading-relaxed">
            {product.description}
          </p>

          {product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading text-lg font-bold text-black dark:text-white mb-2 uppercase tracking-wide">Características</h3>
              <ul className="space-y-1">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-neutral-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tech_sheet_url && (
            <a
              href={product.tech_sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Descargar ficha técnica (PDF)
            </a>
          )}

          <p className="text-sm text-neutral-400 dark:text-gray-500 mb-4">
            {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
          </p>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium text-neutral-600 dark:text-gray-300">Cantidad:</label>
            <div className="flex items-center border border-neutral-200 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold dark:text-gray-200">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="p-2 text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!product.price_on_request && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
            </button>
          )}

          <button
            onClick={handleAddToQuote}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              addedQuote
                ? 'bg-green-500 text-white'
                : product.price_on_request
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'border border-accent-500 text-accent-600 dark:text-accent-400 hover:bg-accent-500 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {addedQuote ? (
              <>
                <Check className="w-5 h-5" />
                Agregado a cotización
              </>
            ) : (
              <>
                <ClipboardList className="w-5 h-5" />
                {product.price_on_request ? 'Solicitar cotización' : 'Agregar a cotización'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
