import { AlertTriangle, X } from 'lucide-react'

function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, type = 'warning', children }) {
  const confirmColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-500 hover:bg-primary-600'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-heading text-lg font-bold text-black dark:text-white uppercase tracking-wide mb-2">
            {title || 'Confirmar'}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-gray-400 mb-6">
            {message || '¿Estás seguro?'}
          </p>
          {children}
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 dark:text-gray-300 border border-neutral-200 dark:border-gray-600 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            >
              {cancelLabel || 'Cancelar'}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${confirmColor}`}
            >
              {confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
