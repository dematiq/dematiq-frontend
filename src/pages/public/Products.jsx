import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useQuote } from '../../contexts/QuoteContext'
import { useAuth } from '../../contexts/AuthContext'
import { Search, ShoppingCart, ClipboardList, Check, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi, brandsApi } from '../../services/api'
import { useLogo } from '../../hooks/useLogo'
import CategorySidebar from '../../components/ui/CategorySidebar'

function BrandLogoCarousel({ brands, selectedBrand, onSelectBrand }) {
  const containerRef = useRef(null)
  const intervalRef = useRef(null)
  const [page, setPage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const total = brands.length
  const CARD_W = 160

  const goTo = (p) => setPage(p)

  useEffect(() => {
    if (total === 0) return
    intervalRef.current = setInterval(() => {
      setPage(prev => prev + 1)
    }, 3500)
    return () => clearInterval(intervalRef.current)
  }, [total])

  useEffect(() => {
    if (page < total || total === 0) return
    const t = setTimeout(() => {
      setIsTransitioning(false)
      setPage(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setIsTransitioning(true)))
    }, 500)
    return () => clearTimeout(t)
  }, [page, total])

  const pause = () => clearInterval(intervalRef.current)
  const resume = () => {
    clearInterval(intervalRef.current)
    if (total === 0) return
    intervalRef.current = setInterval(() => {
      setPage(prev => prev + 1)
    }, 3500)
  }

  if (!brands || total === 0) return null

  const offset = -(page * CARD_W)

  return (
    <div className="mb-8">
      <h2 className="font-heading text-lg font-bold text-black dark:text-white uppercase tracking-wide mb-4">Marcas</h2>
      <div className="relative group" onMouseEnter={pause} onMouseLeave={resume}>
        <button
          onClick={() => setPage(prev => prev <= 0 ? total - 1 : prev - 1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50 dark:hover:bg-gray-600"
          aria-label="Anterior marca"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-gray-300" />
        </button>
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex gap-4"
            style={{
              transform: `translateX(${offset}px)`,
              transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
            }}
          >
            {brands.concat(brands).map((brand, i) => (
              <button
                key={`${brand.id}-${i}`}
                onClick={() => onSelectBrand && onSelectBrand(selectedBrand?.id === brand.id ? null : brand)}
                className={`flex-shrink-0 w-36 h-24 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-200 ${
                  selectedBrand?.id === brand.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-neutral-300 dark:hover:border-gray-500 hover:shadow-sm'
                }`}
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="h-10 max-w-[80%] object-contain" />
                ) : (
                  <span className="text-lg font-bold text-neutral-300 dark:text-gray-600">{brand.name.charAt(0)}</span>
                )}
                <span className="text-[11px] font-medium text-neutral-500 dark:text-gray-400 truncate max-w-[90%]">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => goTo(page + 1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50 dark:hover:bg-gray-600"
          aria-label="Siguiente marca"
        >
          <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-gray-300" />
        </button>
      </div>
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === page % total ? 'bg-black dark:bg-white w-4' : 'bg-neutral-300 dark:bg-gray-600'
              }`}
              aria-label={`Ir a marca ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BrandCarousel({ brands, selectedBrand, onSelectBrand }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  if (!brands || brands.length === 0) return null

  return (
    <div className="relative mb-6">
      <h2 className="font-heading text-sm font-bold text-black dark:text-white uppercase tracking-wide mb-3">Marcas disponibles</h2>
      <div className="relative group">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50 dark:hover:bg-gray-600"
          aria-label="Desplazar izquierda"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-600 dark:text-gray-300" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelectBrand && onSelectBrand(selectedBrand?.id === brand.id ? null : brand)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                selectedBrand?.id === brand.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-gray-800 text-neutral-600 dark:text-gray-300 border-neutral-200 dark:border-gray-600 hover:border-neutral-300 dark:hover:border-gray-500 hover:shadow-sm'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white dark:bg-gray-700 border border-neutral-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50 dark:hover:bg-gray-600"
          aria-label="Desplazar derecha"
        >
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  )
}

function Products() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { addItem: addQuote } = useQuote()
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [recentlyAdded, setRecentlyAdded] = useState(null)
  const [recentlyAddedQuote, setRecentlyAddedQuote] = useState(null)
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearchTerm(q)
  }, [searchParams])

  useEffect(() => {
    if (recentlyAdded) {
      const timer = setTimeout(() => setRecentlyAdded(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [recentlyAdded])

  useEffect(() => {
    if (recentlyAddedQuote) {
      const timer = setTimeout(() => setRecentlyAddedQuote(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [recentlyAddedQuote])

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ status: 'active', limit: 200 }),
      brandsApi.getAll({ status: 'active' }),
    ]).then(([productsData, brandsData]) => {
      setProducts(Array.isArray(productsData) ? productsData : productsData.products)
      setBrands(brandsData)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const brandsByCategory = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      if (!p.brand_id || !p.brand) return
      if (!map[p.category_id]) map[p.category_id] = {}
      if (!map[p.category_id][p.brand_id]) {
        map[p.category_id][p.brand_id] = {
          id: p.brand_id,
          name: p.brand,
          slug: p.brand_slug || '',
          logo_url: p.brand_logo,
          count: 0,
        }
      }
      map[p.category_id][p.brand_id].count++
    })
    const result = {}
    Object.keys(map).forEach((catId) => {
      result[catId] = Object.values(map[catId]).sort((a, b) => b.count - a.count)
    })
    return result
  }, [products])

  const subBrands = useMemo(() => {
    if (!selectedCategory || selectedCategory.isParent) return []
    return brandsByCategory[selectedCategory.id] || []
  }, [brandsByCategory, selectedCategory])

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/iniciar-sesion'); return }
    addItem(product)
    setRecentlyAdded(product.id)
  }

  const handleAddToQuote = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/iniciar-sesion'); return }
    addQuote(product, 1)
    setRecentlyAddedQuote(product.id)
  }

  const { logoUrl } = useLogo()

  const filtered = products.filter((p) => {
    const matchCategory = !selectedCategory || selectedCategory.filterIds.includes(p.category_id)
    const matchBrand = !selectedBrand || p.brand_id === selectedBrand.id
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchBrand && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <img src={logoUrl} alt="Dematiq" className="h-20 md:h-28" />
          <p className="text-neutral-400 dark:text-gray-500 text-sm mt-2">
            {filtered.length} productos encontrados
            {selectedBrand && <span className="text-primary-500 dark:text-primary-300"> â€” {selectedBrand.name}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setShowSidebar(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
            CategorÃ­as
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 dark:text-gray-600" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white transition-colors bg-transparent dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <BrandLogoCarousel
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      {!selectedCategory?.isParent && subBrands.length > 0 && (
        <BrandCarousel
          brands={subBrands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
        />
      )}

      <div className="flex gap-6">
        <div className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              brandsByCategory={brandsByCategory}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
            />
          </div>
        </div>

        {showSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={() => setShowSidebar(false)} />
            <div className="fixed inset-y-0 left-0 w-52 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-gray-700 flex-shrink-0">
                <h2 className="font-heading text-sm font-bold text-black dark:text-white uppercase tracking-wide">CategorÃ­as</h2>
                <button onClick={() => setShowSidebar(false)} className="p-1 text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Cerrar categorÃ­as">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat)
                  setShowSidebar(false)
                }}
                brandsByCategory={brandsByCategory}
                selectedBrand={selectedBrand}
                onSelectBrand={(brand) => {
                  setSelectedBrand(brand)
                  setShowSidebar(false)
                }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-neutral-200 dark:bg-gray-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 bg-neutral-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-20 bg-neutral-200 dark:bg-gray-700 rounded" />
                    <div className="h-9 w-full bg-neutral-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  to={`/productos/${product.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-neutral-100 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900 hover:border-neutral-200 dark:hover:border-gray-600 transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-neutral-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[11px] font-medium text-neutral-400 dark:text-gray-500 uppercase tracking-wider">
                        {product.category}
                      </p>
                      {product.brand && (
                        <>
                          <span className="text-neutral-300 dark:text-gray-600">|</span>
                          <p className="text-[11px] font-medium text-neutral-400 dark:text-gray-500 uppercase tracking-wider">
                            {product.brand}
                          </p>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-gray-200 leading-snug mb-2 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors line-clamp-3 break-words">
                      {product.name}
                    </h3>
                    {product.price_on_request ? (
                      <p className="text-lg font-bold text-primary-500 dark:text-primary-300 mb-3">
                        Consultar precio
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {!product.price_on_request && (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            recentlyAdded === product.id
                              ? 'bg-green-600 text-white'
                              : 'bg-neutral-900 dark:bg-gray-600 text-white hover:bg-neutral-800 dark:hover:bg-gray-500 active:scale-[0.98]'
                          }`}
                        >
                          {recentlyAdded === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Agregado
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Carrito
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleAddToQuote(product, e)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                          recentlyAddedQuote === product.id
                            ? 'bg-green-600 text-white'
                            : 'border border-neutral-300 dark:border-gray-600 text-neutral-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 hover:border-neutral-400 dark:hover:border-gray-500 active:scale-[0.98]'
                        }`}
                      >
                        {recentlyAddedQuote === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Agregado
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-3.5 h-3.5" />
                            Cotizar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-neutral-300 dark:text-gray-600" />
              </div>
              <p className="text-neutral-500 dark:text-gray-400 font-medium">No encontramos productos</p>
              <p className="text-neutral-400 dark:text-gray-500 text-sm mt-1">Intenta con otros filtros o bÃºsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
