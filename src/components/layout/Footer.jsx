import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { settingsApi } from '../../services/api'

function Footer() {
  const [docs, setDocs] = useState({ terminos: '', privacidad: '', devoluciones: '', faq: '' })
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let active = true
    settingsApi.get('terminos_pdf_url').then((u) => active && setDocs((d) => ({ ...d, terminos: u }))).catch(() => {})
    settingsApi.get('politica_privacidad_pdf_url').then((u) => active && setDocs((d) => ({ ...d, privacidad: u }))).catch(() => {})
    settingsApi.get('politica_devoluciones_pdf_url').then((u) => active && setDocs((d) => ({ ...d, devoluciones: u }))).catch(() => {})
    settingsApi.get('faq_pdf_url').then((u) => active && setDocs((d) => ({ ...d, faq: u }))).catch(() => {})
    return () => { active = false }
  }, [])

  const renderDocLink = (label, url) =>
    url
      ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-300 transition-colors">
          {label}
        </a>
      )
      : (
        <span className="text-primary-300/60">{label}</span>
      )

  return (
    <footer className="bg-primary-900 dark:bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-primary-200 text-sm">
              Partes PLC y automatización industrial. Calidad certificada para la industria.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3 text-white uppercase tracking-wider text-sm">Enlaces</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link to="/productos" className="hover:text-accent-300 transition-colors">Productos</Link></li>
              <li><Link to="/carrito" className="hover:text-accent-300 transition-colors">Carrito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3 text-white uppercase tracking-wider text-sm">Soporte</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><a href="#" className="hover:text-accent-300 transition-colors">Contacto técnico</a></li>
              <li>{renderDocLink('Devoluciones', docs.devoluciones)}</li>
              <li>{renderDocLink('FAQ', docs.faq)}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3 text-white uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>{renderDocLink('Términos y condiciones', docs.terminos)}</li>
              <li>{renderDocLink('Política de privacidad', docs.privacidad)}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-300 text-sm">
          &copy; {currentYear} Dematiq v2. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

export default Footer
