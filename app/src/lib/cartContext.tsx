import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Product } from '@/lib/data'

export interface CartItem {
  product: Product
  size: string
  color: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addItem: (product: Product, size: string, color: string) => void
  removeItem: (productId: string | number, size: string, color: string) => void
  updateQuantity: (productId: string | number, size: string, color: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'manmandir_cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function productId(p: Product): string {
  return String((p as any)._id || p.id)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  // Persist on every change
  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((product: Product, size: string, color: string) => {
    const id = productId(product)
    setItems((prev) => {
      const existing = prev.find(
        (i) => productId(i.product) === id && i.size === size && i.color === color
      )
      if (existing) {
        return prev.map((i) =>
          productId(i.product) === id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, size, color, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((pid: string | number, size: string, color: string) => {
    const sid = String(pid)
    setItems((prev) =>
      prev.filter((i) => !(productId(i.product) === sid && i.size === size && i.color === color))
    )
  }, [])

  const updateQuantity = useCallback(
    (pid: string | number, size: string, color: string, qty: number) => {
      const sid = String(pid)
      if (qty <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(productId(i.product) === sid && i.size === size && i.color === color))
        )
      } else {
        setItems((prev) =>
          prev.map((i) =>
            productId(i.product) === sid && i.size === size && i.color === color
              ? { ...i, quantity: qty }
              : i
          )
        )
      }
    },
    []
  )

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((acc, i) => acc + i.quantity, 0)
  const total = items.reduce((acc, i) => {
    const price = i.product.discountedPrice || i.product.price || 0
    return acc + price * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
