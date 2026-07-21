import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function SareesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('category', 'saree')
    
    // Preserve any existing query params
    searchParams.forEach((value, key) => {
      if (key !== 'category') {
        params.set(key, value)
      }
    })
    
    navigate(`/products?${params.toString()}`, { replace: true })
  }, [navigate, searchParams])

  return null
}
