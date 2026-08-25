import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    name: isEditing ? 'Producto existente' : '',
    price: isEditing ? '299.99' : '',
    category: isEditing ? 'Electrónicos' : '',
    stock: isEditing ? '15' : '',
    description: isEditing ? 'Descripción del producto...' : '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await new Promise((resolve) => setTimeout(resolve, 500))
    navigate('/admin/productos')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-black dark:text-white mb-6 uppercase tracking-wide">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-neutral-100 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
              Precio
            </label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault() }}
              className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault() }}
              className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
            Categoría
          </label>
          <select
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
          >
            <option value="">Seleccionar categoría</option>
            <option value="Electrónicos">Electrónicos</option>
            <option value="Ropa">Ropa</option>
            <option value="Hogar">Hogar</option>
            <option value="Deportes">Deportes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-transparent dark:text-gray-200"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-black dark:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-800 dark:hover:bg-gray-500 transition-colors"
          >
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-6 py-2.5 rounded-lg font-semibold text-neutral-600 dark:text-gray-300 border border-neutral-200 dark:border-gray-600 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
