import { useCallback } from 'react'

/**
 * Valida y redimensiona una imagen antes de subirla
 * @param {File} file - Archivo de imagen
 * @param {Object} options - Opciones de validación
 * @param {number} options.maxWidth - Ancho máximo en px (default: 1600)
 * @param {number} options.maxHeight - Alto máximo en px (default: 1600)
 * @param {number} options.maxSizeKB - Tamaño máximo en KB (default: 1200)
 * @param {number} options.quality - Calidad JPEG/WebP 0-1 (default: 0.9)
 * @returns {Promise<{file: File, preview: string}|null>} - File redimensionado + preview URL, o null si error
 */
export function useImageValidator() {
  const validateAndResize = useCallback(async (file, options = {}) => {
    const {
      maxWidth = 1600,
      maxHeight = 1600,
      maxSizeKB = 1200,
      quality = 0.9,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    } = options

    // 1. Validar tipo
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato no válido. Usa JPG, PNG o WebP.')
    }

    // 2. Validar tamaño original (aviso, no bloqueo)
    const originalSizeKB = file.size / 1024
    if (originalSizeKB > maxSizeKB * 3) {
      // Muy grande, pero intentaremos comprimir
      console.warn(`Imagen muy grande (${Math.round(originalSizeKB)}KB), se comprimirá`)
    }

    // 3. Leer imagen y obtener dimensiones
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = objectUrl
      })

      // 4. Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img
      let scale = 1

      if (width > maxWidth) {
        scale = maxWidth / width
      }
      if (height * scale > maxHeight) {
        scale = maxHeight / height
      }

      const newWidth = Math.round(width * scale)
      const newHeight = Math.round(height * scale)

      // 5. Dibujar en canvas y redimensionar
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // 5. Convertir a blob comprimido
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality)
      })

      // 6. Validar tamaño final
      const finalSizeKB = blob.size / 1024
      if (finalSizeKB > maxSizeKB) {
        throw new Error(`La imagen comprimida sigue siendo muy grande (${Math.round(finalSizeKB)}KB). Máximo ${maxSizeKB}KB. Intenta con una imagen más pequeña.`)
      }

      // 7. Crear nuevo File con nombre limpio
      const ext = file.type === 'image/png' ? '.png' : '.jpg'
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
      const newFile = new File([blob], `${baseName}${ext}`, { type: blob.type })

      // Preview para mostrar al usuario
      const previewUrl = URL.createObjectURL(newFile)

      return { file: newFile, preview: previewUrl, width: newWidth, height: newHeight }
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return { validateAndResize }
}

export default useImageValidator