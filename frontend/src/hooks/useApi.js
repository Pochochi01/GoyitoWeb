import { useState, useCallback } from 'react'

/**
 * Hook genérico para manejar llamadas a la API con estado de carga y error.
 *
 * Uso:
 *   const { data, loading, error, execute } = useApi(productService.getAll)
 *   useEffect(() => { execute({ page: 1 }) }, [])
 *
 * Con parámetros inmediatos:
 *   const { data, loading, execute } = useApi(supplierService.remove)
 *   await execute(id)
 */
export function useApi(fn, initialData = null) {
  const [data,    setData]    = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      setData(result)
      return result
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error inesperado'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { data, loading, error, execute, setData }
}

/**
 * Versión simplificada para mutaciones (POST/PATCH/DELETE).
 * No guarda el resultado en estado, solo maneja loading/error.
 *
 * Uso:
 *   const { mutate, loading, error } = useMutation(productService.remove)
 *   await mutate(id)
 */
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      return await fn(...args)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error inesperado'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { mutate, loading, error }
}
