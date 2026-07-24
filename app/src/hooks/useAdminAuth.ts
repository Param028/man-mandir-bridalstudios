import { useState, useEffect, useCallback } from 'react'

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@manmandir.com',
  password: 'ManMandir@2024'
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is logged in (localStorage)
    const adminSession = localStorage.getItem('adminSession')
    setIsAuthenticated(!!adminSession)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Check against hardcoded credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminSession', 'true')
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (err) {
      console.error('Login failed:', err)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('adminSession')
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, isLoading, login, logout }
}

