import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { categoriesApi } from '../../services/api'

function CategorySidebar({ selectedCategory, onSelectCategory, brandsByCategory = {}, selectedBrand, onSelectBrand }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    categoriesApi.getTree({ status: 'active' })
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredCategories = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter((cat) => {
      if (cat.name.toLowerCase().includes(q)) return true
      return cat.subcategories?.some((sub) => sub.name.toLowerCase().includes(q))
    })
  }, [categories, search])

  const toggleExpand = (slug) => {
    setExpanded((prev) => {
      const next = { ...prev, [slug]: !prev[slug] }
      return next
    })
  }

  const isAllSelected = selectedCategory === null && selectedBrand === null

  const handleAllClick = () => {
    onSelectCategory(null)
    if (onSelectBrand) onSelectBrand(null)
  }

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-gray-700 space-y-3">
        <h2 className="font-heading text-sm font-bold text-black dark:text-white uppercase tracking-wide">Categorias</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 dark:text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-transparent dark:text-gray-200"
          />
        </div>
      </div>

      <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        <button
          onClick={handleAllClick}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isAllSelected
              ? 'bg-primary-500 text-white'
              : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700'
          }`}
        >
          Todos los productos
        </button>

        {loading && (
          <div className="space-y-2 mt-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 bg-neutral-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <p className="text-xs text-neutral-400 dark:text-gray-500 text-center py-6">
            {search ? 'No se encontraron Categorias' : 'No hay Categorias disponibles'}
          </p>
        )}

        {!loading && (
          <div className="mt-1 space-y-0.5">
            {filteredCategories.map((cat) => {
              const isActive = selectedCategory?.id === cat.id && !selectedCategory?.isSubcategory
              const hasSubcategorySelected = cat.subcategories?.some(
                (sub) => sub.id === selectedCategory?.id || sub.id === selectedCategory?.parentId
              )
              const expandKey = cat.slug || cat.id
              const isExpanded =
                expanded[expandKey] || isActive || hasSubcategorySelected
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
              const subIds = hasSubcategories ? cat.subcategories.map((s) => s.id) : []

              const handleCategoryClick = () => {
                onSelectCategory({ id: cat.id, name: cat.name, filterIds: [cat.id, ...subIds], isParent: hasSubcategories })
                if (onSelectBrand) onSelectBrand(null)
                if (hasSubcategories) {
                  setExpanded((prev) => ({ ...prev, [expandKey]: true }))
                }
              }

              return (
                <div key={cat.id || cat.slug}>
                  <div className="flex items-center min-w-0 gap-0.5">
                    <button
                      onClick={handleCategoryClick}
                      className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg text-sm font-medium leading-snug transition-colors break-words ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                    {hasSubcategories && (
                      <button
                        onClick={() => toggleExpand(expandKey)}
                        aria-label={isExpanded ? 'Colapsar subCategorias' : 'Expandir subCategorias'}
                        aria-expanded={isExpanded}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                          isActive || hasSubcategorySelected
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'text-neutral-400 dark:text-gray-500 hover:bg-neutral-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubcategories && isExpanded && (
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-neutral-100 dark:border-gray-700 pl-2">
                      {cat.subcategories.map((sub) => {
                        const isSubActive = selectedCategory?.id === sub.id && !selectedBrand
                        const brands = brandsByCategory[sub.id] || []
                        const isSubExpanded = expanded[`sub-${sub.id}`] ||
                          isSubActive ||
                          selectedCategory?.id === sub.id ||
                          brands.some(b => b.id === selectedBrand?.id)

                        return (
                          <div key={sub.id || sub.slug}>
                            <button
                              onClick={() => {
                                onSelectCategory({ id: sub.id, name: sub.name, filterIds: [sub.id], isParent: false, parentId: cat.id })
                                if (onSelectBrand) onSelectBrand(null)
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors leading-snug break-words ${
                                isSubActive
                                  ? 'bg-primary-500 text-white font-medium'
                                  : 'text-neutral-500 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-gray-700 hover:text-neutral-700 dark:hover:text-gray-200'
                              }`}
                            >
                              {sub.name}
                            </button>

                            {brands.length > 0 && (
                              <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-neutral-100 dark:border-gray-700 pl-2">
                                {brands.map((brand) => {
                                  const isBrandActive = selectedBrand?.id === brand.id
                                  return (
                                    <button
                                      key={brand.id}
                                      onClick={() => {
                                        if (onSelectBrand) onSelectBrand(brand)
                                        onSelectCategory({ id: sub.id, name: sub.name, filterIds: [sub.id], isParent: false, parentId: cat.id })
                                      }}
                                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                        isBrandActive
                                          ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300 font-medium'
                                          : 'text-neutral-400 dark:text-gray-500 hover:bg-neutral-50 dark:hover:bg-gray-700 hover:text-neutral-600 dark:hover:text-gray-300'
                                      }`}
                                    >
                                      <span className="break-words">{brand.name}</span>
                                      <span className="text-[10px] opacity-60 flex-shrink-0 ml-1">{brand.count}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

export default CategorySidebar
