import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { ordersApi, paymentsApi, settingsApi } from '../../services/api'
import { AlertCircle, ExternalLink, FileText, Info } from 'lucide-react'

const cfdiOptions = [
  { value: 'G01', label: 'Adquisición de mercancías' },
  { value: 'G02', label: 'Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'Gastos en general' },
  { value: 'I01', label: 'Construcciones' },
  { value: 'I02', label: 'Mobiliario y equipo de oficina' },
  { value: 'I03', label: 'Equipo de transporte' },
  { value: 'D01', label: 'Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D10', label: 'Pagos por servicios educativos' },
]

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkoutNotes, setCheckoutNotes] = useState('')

  useEffect(() => {
    settingsApi.get('checkout_notes').then(setCheckoutNotes).catch(() => {})
  }, [])
  const [needsInvoice, setNeedsInvoice] = useState(false)
  const [form, setForm] = useState({
    company: '',
    contact: '',
    address: '',
    city: '',
    zip: '',
    notes: '',
  })
  const [invoice, setInvoice] = useState({
    rfc: '',
    business_name: '',
    email: user?.email || '',
    cfdi_use: 'G03',
    zip: '',
    regime: '601',
    fiscal_address: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError('Debes iniciar sesión para realizar un pedido')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        user_id: user.id,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          company: form.company,
          contact: form.contact,
          street: form.address,
          city: form.city,
          zip: form.zip,
        },
        notes: form.notes || undefined,
      }

      if (needsInvoice) {
        payload.needs_invoice = true
        payload.invoice_rfc = invoice.rfc
        payload.invoice_business_name = invoice.business_name
        payload.invoice_email = invoice.email
        payload.invoice_cfdi_use = invoice.cfdi_use
        payload.invoice_zip = invoice.zip
        payload.invoice_regime = invoice.regime
        payload.invoice_fiscal_address = invoice.fiscal_address
      }

      const order = await ordersApi.create(payload)

      const data = await paymentsApi.createPreference(order.id)
      clearCart()
      window.location.href = data.init_point
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-4xl font-bold text-black mb-8 uppercase tracking-wide">Checkout</h1>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Debes <a href="/iniciar-sesion" className="underline font-semibold">iniciar sesión</a> para completar tu pedido
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-black mb-4 uppercase tracking-wide">Información de envío</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Empresa</label>
                <input type="text" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contacto</label>
                <input type="text" required value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Dirección</label>
                <input type="text" required value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ciudad</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Código postal</label>
                <input type="text" required maxLength={5} value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value.replace(/\D/g, '').slice(0, 5)})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Notas del pedido</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needsInvoice}
                onChange={(e) => setNeedsInvoice(e.target.checked)}
                className="w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-500" />
                <span className="font-heading text-lg font-bold text-black uppercase tracking-wide">¿Necesitas factura?</span>
              </div>
            </label>

            {needsInvoice && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">RFC <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={invoice.rfc}
                    onChange={(e) => setInvoice({...invoice, rfc: e.target.value.toUpperCase()})}
                    placeholder="XXX000000XXX"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Razón Social <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={invoice.business_name}
                    onChange={(e) => setInvoice({...invoice, business_name: e.target.value})}
                    placeholder="Nombre o razón social"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Correo para factura <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={invoice.email}
                    onChange={(e) => setInvoice({...invoice, email: e.target.value})}
                    placeholder="factura@ejemplo.com"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Uso de CFDI</label>
                  <select
                    value={invoice.cfdi_use}
                    onChange={(e) => setInvoice({...invoice, cfdi_use: e.target.value})}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {cfdiOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Código Postal Fiscal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={invoice.zip}
                    onChange={(e) => setInvoice({...invoice, zip: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                    placeholder="12345"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Régimen Fiscal</label>
                  <select
                    value={invoice.regime}
                    onChange={(e) => setInvoice({...invoice, regime: e.target.value})}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="601">General de Ley Personas Morales</option>
                    <option value="605">Sueldos y Salarios e Ingresos Asimilados</option>
                    <option value="606">Arrendamiento</option>
                    <option value="607">Régimen de Enajenación o Adquisición de Bienes</option>
                    <option value="608">Demás ingresos</option>
                    <option value="609">Consolidación</option>
                    <option value="610">Residentes en el Extranjero sin Establecimiento Permanente en México</option>
                    <option value="611">Ingresos por Dividendos (socios y accionistas)</option>
                    <option value="612">Personas Físicas con Actividades Empresariales y Profesionales</option>
                    <option value="614">Ingresos por intereses</option>
                    <option value="615">Régimen de los ingresos por obtención de premios</option>
                    <option value="616">Sin obligaciones fiscales</option>
                    <option value="620">Sociedades Cooperativas de Producción que optan por diferir sus ingresos</option>
                    <option value="621">Incorporación Fiscal</option>
                    <option value="622">Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>
                    <option value="623">Opcional para Grupos de Sociedades</option>
                    <option value="624">Coordinados</option>
                    <option value="625">Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                    <option value="626">Régimen Simplificado de Confianza</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Domicilio Fiscal</label>
                  <textarea
                    rows={2}
                    value={invoice.fiscal_address}
                    onChange={(e) => setInvoice({...invoice, fiscal_address: e.target.value})}
                    placeholder="Calle, número, colonia, municipio, estado, CP"
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-black mb-4 uppercase tracking-wide">Método de pago</h2>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Mercado Pago</p>
                  <p className="text-xs text-neutral-500">Paga con tarjeta, transferencia o efectivo</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !user}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Redirigiendo a Mercado Pago...' : `Pagar $${totalPrice.toFixed(2)} con Mercado Pago`}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6">
            <h2 className="font-heading text-lg font-bold text-black mb-4 uppercase tracking-wide">Resumen</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600 truncate">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-neutral-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-neutral-600 text-sm mb-1">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-sm mb-1">
                <span>Envío</span>
                <span>Grátis</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-800 text-lg mt-2">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {checkoutNotes && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 whitespace-pre-line">{checkoutNotes}</div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Checkout
