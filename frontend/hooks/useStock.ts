"use client"

import { useState, useEffect } from "react"
import type { StockItem } from "@/types/stock"
import { stockApi } from "@/lib/api"

export function useStock(departmentId?: number) {
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockApi.getStock(departmentId)
      setStock(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStock()
  }, [departmentId])

  return { stock, loading, error, refetch: fetchStock }
}
