import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 transition-colors"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default PasswordInput