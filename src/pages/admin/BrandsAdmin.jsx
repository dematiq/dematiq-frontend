import { useState, useEffect, useRef } from 'react'
import { Plus, X, Search, ExternalLink, Upload as UploadIcon, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { brandsApi, uploadImage } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useImageValidator } from '../../hooks/useImageValidator'

const statusLabels = { active: 'Activo', inactive: 'Inactivo' }

function BrandModal({ brand, onClose, onSave }) {
  const toast = useToast()
  const isEditing = Boolean(brand)
  const [form, setForm] = useState({
    name: brand?.name || '',
    description: brand?.description || '',
    logo_url: brand?.logo_url || '',
    website_url: brand?.website_url || '',
    status: brand?.status || 'active',
  })
  const [pendingFile, setPendingFile] = useState(null)
  const [preview, setPreview] = useState(brand?.logo_url || '')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const { validateAndResize } = useImageValidator()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG o WebP.')
      return
    }
    setPendingFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (preview && !form.logo_url) URL.revokeObjectURL(preview)
    setPendingFile(null)
    setPreview('')
    setForm((prev) => ({ ...prev, logo_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.warning('El nombre es requerido')
      return
    }
    setSaving(true)
    try {
      let logoUrl = form.logo_url
      if (pendingFile) {
        const result = await validateAndResize(pendingFile, {
          maxWidth: 400,
          maxHeight: 400,
          maxSizeKB: 200,
          quality: 0.85,
        })
        logoUrl = await uploadImage(result.file)
      }
      if (preview && !form.logo_url) URL.revokeObjectURL(preview)

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        logo_url: logoUrl || null,
        website_url: form.website_url.trim() || null,
        status: form.status,
      }
      if (isEditing) {
        await brandsApi.update(brand.id, payload)
      } else {
        await brandsApi.create(payload)
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-black dark:text-white uppercase tracking-wide">
            {isEditing ? 'Editar marca' : 'Nueva marca'}
          </h2>
          <button onClick={onClose} className="p-1 text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" placeholder="Nombre de la marca" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none bg-transparent dark:text-gray-200" placeholder="Descripción de la marca" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Logo</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-dashed border-neutral-200 dark:border-gray-600 rounded-lg text-sm text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 hover:border-neutral-300 dark:hover:border-gray-500 cursor-pointer transition-colors">
                <UploadIcon className="w-4 h-4" />
                {preview ? 'Cambiar logo' : 'Subir logo'}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
              {pendingFile && <span className="text-xs text-neutral-400 dark:text-gray-500">(sin guardar)</span>}
              {preview && (
                <button type="button" onClick={clearImage} className="p-2 text-neutral-300 dark:text-gray-600 hover:text-red-500 transition-colors" aria-label="Eliminar imagen">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {preview && (
              <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-gray-600 cursor-pointer" onClick={() => setPreviewOpen(true)}>
                <img src={preview} alt="" className="w-full h-full object-contain" />
              </div>
            )}
            {previewOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
                <div className="fixed inset-0 bg-black/70" />
                <div className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
                  <img src={preview} alt="" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => setPreviewOpen(false)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Sitio web</label>
            <input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600">
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear marca'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg font-semibold text-neutral-600 dark:text-gray-300 border border-neutral-200 dark:border-gray-600 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BrandsAdmin() {
  const toast = useToast()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, brand: null })
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await brandsApi.getAll()
      setBrands(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => setModal({ open: true, brand: null })
  const openEdit = (brand) => setModal({ open: true, brand })
  const closeModal = () => setModal({ open: false, brand: null })
  const handleSave = () => { closeModal(); load() }

  const handleToggleStatus = (brand) => {
    const isActive = brand.status === 'active'
    setConfirm({
      brand,
      title: isActive ? 'Deshabilitar marca' : 'Activar marca',
      message: isActive
        ? `¿Estás seguro de deshabilitar "${brand.name}"?`
        : `¿Estás seguro de activar "${brand.name}"?`,
      confirmLabel: isActive ? 'Deshabilitar' : 'Activar',
      type: isActive ? 'danger' : 'warning',
    })
  }

  const confirmToggle = async () => {
    if (!confirm) return
    const { brand } = confirm
    const isActive = brand.status === 'active'
    setConfirm(null)
    try {
      if (isActive) {
        await brandsApi.delete(brand.id)
      } else {
        await brandsApi.update(brand.id, { status: 'active' })
      }
      toast.success(isActive ? 'Marca deshabilitada' : 'Marca activada')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = search
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black dark:text-white uppercase tracking-wide">Marcas</h1>
          <p className="text-neutral-500 dark:text-gray-400 text-sm mt-1">{brands.length} marcas en total</p>
        </div>
        <button onClick={openNew} className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva marca
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 dark:text-gray-600" />
        <input
          type="text"
          placeholder="Buscar marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800">
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Sitio web</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 dark:text-gray-500">Cargando...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 dark:text-gray-500">
                    {search ? 'No se encontraron marcas' : 'No hay marcas. Crea la primera.'}
                  </td>
                </tr>
              ) : filtered.map((brand) => (
                <tr key={brand.id} className="border-b border-neutral-50 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {brand.logo_url && (
                        <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-contain rounded" />
                      )}
                      <span className="font-medium text-black dark:text-white">{brand.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 dark:text-gray-500 text-xs font-mono">{brand.slug}</td>
                  <td className="py-3 px-4 text-neutral-500 dark:text-gray-400 text-sm max-w-xs truncate">{brand.description || '—'}</td>
                  <td className="py-3 px-4">
                    {brand.website_url ? (
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-500 dark:text-primary-300 hover:underline inline-flex items-center gap-1 text-xs">
                        <ExternalLink className="w-3 h-3" /> Visitar
                      </a>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${brand.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                      {statusLabels[brand.status] || brand.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(brand)} className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-gray-400 font-medium text-xs">Editar</button>
                      <button onClick={() => handleToggleStatus(brand)} className={`inline-flex items-center gap-1 font-medium text-xs ${brand.status === 'active' ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}>
                        {brand.status === 'active' ? <><ToggleLeft className="w-3.5 h-3.5" /> Deshabilitar</> : <><ToggleRight className="w-3.5 h-3.5" /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <BrandModal
          brand={modal.brand}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          cancelLabel="Cancelar"
          type={confirm.type}
          onConfirm={confirmToggle}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

export default BrandsAdmin
