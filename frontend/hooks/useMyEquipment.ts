"use client"

import { useState, useEffect } from "react"
import type { MyEquipmentItem } from "@/types/stock"
import { stockApi } from "@/lib/api"

export function useMyEquipment() {
  const [equipment, setEquipment] = useState<MyEquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockApi.getMyEquipment()
      setEquipment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch equipment")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  return { equipment, loading, error, refetch: fetchEquipment }
}
