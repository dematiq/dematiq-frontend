import { useState, useEffect, useRef } from 'react'
import { settingsApi, uploadImage, uploadFile } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Save, Upload, FileText, FileDown, Trash2, Store, ShoppingCart } from 'lucide-react'
import { useSetting } from '../../hooks/useSetting'

const DEFAULT_TAGLINE = 'Partes PLC y automatización industrial. Calidad certificada para la industria.'

function SectionCard({ icon: Icon, title, description, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-5 h-5 text-primary-500" />}
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
      </div>
      {description && <p className="text-sm text-neutral-500 mb-4">{description}</p>}
      {children}
    </div>
  )
}

function DocCard({ settingKey, label }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.get(settingKey)
      .then((u) => {
        setUrl(u)
        if (u) setFileName(u.split('/').pop() || '')
      })
      .catch(() => {})
  }, [settingKey])

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Solo se permiten archivos PDF')
      return
    }
    setFile(f)
  }

  const handleSave = async () => {
    if (!file) {
      toast.info('Selecciona un PDF primero')
      return
    }
    setSaving(true)
    try {
      const uploadedUrl = await uploadFile(file, 'PDF')
      await settingsApi.update(settingKey, uploadedUrl)
      setUrl(uploadedUrl)
      setFileName(file.name)
      setFile(null)
      toast.success('Documento actualizado correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!url) return
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = fileName || 'documento.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar "${label}"? Se quitará el enlace del footer.`)) return
    setSaving(true)
    try {
      await settingsApi.update(settingKey, '')
      setUrl('')
      setFileName('')
      setFile(null)
      toast.success('Documento eliminado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-neutral-50 dark:bg-gray-700/50 rounded-lg border border-neutral-200 dark:border-gray-600 p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>

      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-primary-500 shrink-0" />
        {fileName ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={url}
            className="text-xs text-neutral-600 dark:text-gray-300 truncate hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            {fileName}
          </a>
        ) : (
          <span className="text-xs text-neutral-400">Sin documento subido</span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 min-w-32 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg text-neutral-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-colors overflow-hidden"
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span className="truncate">{file ? file.name : 'Seleccionar PDF'}</span>
        </button>

        {file && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        )}

        {url && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Descargar"
              className="p-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg text-neutral-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Borrar documento"
              disabled={saving}
              className="p-2 text-sm border border-red-200 dark:border-red-900 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Settings() {
  const toast = useToast()
  const fileRef = useRef(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [preview, setPreview] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const { value: tagline, setValue: setTagline, loaded: taglineLoaded } = useSetting('tagline_text', DEFAULT_TAGLINE)
  const [taglineSaving, setTaglineSaving] = useState(false)

  useEffect(() => {
    loadLogo()
    loadNotes()
  }, [])

  const loadLogo = async () => {
    try {
      const url = await settingsApi.get('logo_url')
      setLogoUrl(url)
      setPreview(url)
    } catch {
      // fallback
    }
  }

  const loadNotes = async () => {
    try {
      const val = await settingsApi.get('checkout_notes')
      setNotes(val)
    } catch {
      // fallback
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSaveLogo = async () => {
    if (!selectedFile) {
      toast.info('Selecciona una imagen primero')
      return
    }
    setLoading(true)
    try {
      const url = await uploadImage(selectedFile)
      await settingsApi.update('logo_url', url)
      setLogoUrl(url)
      setSelectedFile(null)
      toast.success('Logo actualizado correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setNotesLoading(true)
    try {
      await settingsApi.update('checkout_notes', notes)
      toast.success('Notas guardadas correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleSaveTagline = async () => {
    setTaglineSaving(true)
    try {
      await settingsApi.update('tagline_text', tagline)
      toast.success('Mensaje guardado correctamente')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTaglineSaving(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Configuración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          icon={Store}
          title="Identidad del sitio"
          description="Logo que se muestra en el header y el footer de la tienda."
        >
        <div className="mb-6">
          <div className="w-48 h-24 bg-neutral-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-gray-600">
            {preview ? (
              <img src={preview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-neutral-400 text-sm">Sin logo</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-gray-600 rounded-lg text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
          </button>

          <button
            onClick={handleSaveLogo}
            disabled={!selectedFile || loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="border-t border-neutral-200 dark:border-gray-700 mt-6 pt-6">
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-1.5">Mensaje de la tienda</label>
          <p className="text-xs text-neutral-500 mb-3">Este texto se muestra en el footer y en la página de registro.</p>
          <input
            type="text"
            value={taglineLoaded ? tagline : ''}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={120}
            className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent text-neutral-900 dark:text-white mb-3"
            placeholder={DEFAULT_TAGLINE}
          />
          <button
            onClick={handleSaveTagline}
            disabled={taglineSaving}
            className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600"
          >
            <Save className="w-4 h-4" />
            {taglineSaving ? 'Guardando...' : 'Guardar mensaje'}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        icon={ShoppingCart}
        title="Checkout"
        description="Este mensaje se mostrará a todos los usuarios en la pantalla de pago, debajo del resumen del pedido."
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y mb-4 bg-transparent text-neutral-900 dark:text-white"
          placeholder="Escribe aquí las notas que se mostrarán en el checkout..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={notesLoading}
          className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600"
        >
          <Save className="w-4 h-4" />
          {notesLoading ? 'Guardando...' : 'Guardar notas'}
        </button>
      </SectionCard>

      <SectionCard
        icon={FileText}
        title="Documentos del footer"
        description="Sube los PDF que se abrirán desde el footer. Puedes descargarlos o borrarlos en cualquier momento."
        className="lg:col-span-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocCard settingKey="terminos_pdf_url" label="Términos y Condiciones" />
          <DocCard settingKey="politica_privacidad_pdf_url" label="Política de Privacidad" />
          <DocCard settingKey="politica_devoluciones_pdf_url" label="Política de Devoluciones" />
          <DocCard settingKey="faq_pdf_url" label="Preguntas frecuentes (FAQ)" />
        </div>
      </SectionCard>
      </div>
    </div>
  )
}

export default Settings
