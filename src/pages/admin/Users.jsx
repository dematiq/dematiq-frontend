import { useState, useEffect } from 'react'
import { X, ToggleLeft, ToggleRight, Lock } from 'lucide-react'
import { usersApi, authApi } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmModal from '../../components/ui/ConfirmModal'

function UserModal({ user, onClose, onSave }) {
  const toast = useToast()
  const isEditing = Boolean(user)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    rfc: user?.rfc || '',
    role: user?.role_raw || 'customer',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.update(user.id, form)
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
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-black dark:text-white uppercase tracking-wide">Editar usuario</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Teléfono</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Empresa</label>
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">RFC</label>
            <input type="text" value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200 max-w-[13ch]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200">
              <option value="customer">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 dark:disabled:bg-gray-600">
              {saving ? 'Guardando...' : 'Guardar cambios'}
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

function Users() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    usersApi.getAll()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggleStatus = (user) => {
    const isActive = user.status === 'active'
    const isAdmin = user.role_raw === 'admin'
    setPassword('')
    setConfirm({
      user,
      requiresPassword: isAdmin,
      title: isActive ? (isAdmin ? 'Deshabilitar administrador' : 'Deshabilitar usuario') : (isAdmin ? 'Activar administrador' : 'Activar usuario'),
      message: isActive
        ? `¿Estás seguro de deshabilitar a "${user.name}"?`
        : `¿Estás seguro de activar a "${user.name}"?`,
      confirmLabel: isActive ? 'Deshabilitar' : 'Activar',
      type: isActive ? 'danger' : 'warning',
    })
  }

  const confirmToggle = async () => {
    if (!confirm) return
    const { user, requiresPassword } = confirm
    const isActive = user.status === 'active'

    if (requiresPassword) {
      if (!password) {
        toast.error('Ingresa tu contraseña para continuar')
        return
      }
      try {
        await authApi.verifyPassword(password)
      } catch (err) {
        toast.error(err.message)
        return
      }
    }

    setConfirm(null)
    try {
      if (isActive) {
        await usersApi.delete(user.id)
      } else {
        await usersApi.update(user.id, { status: 'active' })
      }
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-black dark:text-white mb-6 uppercase tracking-wide">Usuarios</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-gray-700 bg-neutral-50 dark:bg-gray-800">
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Empresa</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-400 dark:text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 dark:text-gray-500">Cargando...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 dark:text-gray-500">No hay usuarios</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-50 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-black dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-gray-300">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-neutral-100 dark:bg-gray-700 text-neutral-700 dark:text-gray-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-gray-300">{user.company_name || '-'}</td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-gray-300">{user.phone || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditUser(user)} className="text-black dark:text-white hover:text-neutral-600 dark:hover:text-gray-400 font-medium text-xs">Editar</button>
                      <button onClick={() => handleToggleStatus(user)} className={`inline-flex items-center gap-1 font-medium text-xs ${user.status === 'active' ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}>
                        {user.status === 'active' ? <><ToggleLeft className="w-3.5 h-3.5" /> Deshabilitar</> : <><ToggleRight className="w-3.5 h-3.5" /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <UserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={load}
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
        >
          {confirm.requiresPassword && (
            <div className="w-full mb-5">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Tu contraseña
                </span>
              </label>
              <input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña para confirmar"
                className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors bg-transparent dark:text-gray-200 text-sm"
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  )
}

export default Users
