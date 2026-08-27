import { useState, useEffect } from 'react'
import { settingsApi } from '../services/api'

export function useSetting(key, fallback = '') {
  const [value, setValue] = useState(fallback)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    settingsApi.get(key)
      .then((val) => {
        if (active && val) setValue(val)
      })
      .catch(() => {})
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [key])

  return { value, setValue, loaded }
}