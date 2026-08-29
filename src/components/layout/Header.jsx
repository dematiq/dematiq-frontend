import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useQuote } from '../../contexts/QuoteContext'
import { ShoppingCart, Menu, X, ClipboardList, User } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { useSetting } from '../../hooks/useSetting'

const DEFAULT_ANNOUNCEMENT = 'Equipos de automatización y control eléctrico'

const navLinks = [
  { path: '/', label: 'Catálogo' },
  { path: '/marcas', label: 'Marcas' },
  { path: '/cotizar', label: 'Cotizar' },
  { path: '/contacto', label: 'Contacto' },
]

function Header() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const { totalItems: quoteItems } = useQuote()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { value: announcement } = useSetting('announcement_text', DEFAULT_ANNOUNCEMENT)
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/productos')
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white text-primary-500 border-white'
                    : 'bg-transparent text-white/80 border-white/20 hover:bg-white/15 hover:text-white hover:border-white/40'
                }`}
              >
                <span className="font-heading text-xs font-semibold uppercase tracking-widest">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="text-white/80 hover:text-white" />

            <Link
              to="/carrito"
              className="relative p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              to="/cotizar"
              className="relative p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Cotizaciones"
            >
              <ClipboardList className="w-5 h-5" />
              {quoteItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {quoteItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white hover:text-primary-500 text-sm font-semibold transition-all duration-200"
                  >
                    <span className="font-heading text-xs font-semibold uppercase tracking-widest">Admin</span>
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/iniciar-sesion"
                className="bg-white text-primary-500 hover:bg-neutral-100 px-5 py-2 rounded text-sm font-semibold transition-colors"
              >
                Ingresar
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-white/15 pt-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-white text-primary-500 border-white'
                    : 'bg-transparent text-white/80 border-white/20 hover:bg-white/15 hover:text-white hover:border-white/40'
                }`}
              >
                <span className="font-heading text-xs font-semibold uppercase tracking-widest">{link.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="bg-primary-400 dark:bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-white text-center text-base sm:text-lg lg:text-xl font-heading font-bold uppercase tracking-widest">
            {announcement}
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header
