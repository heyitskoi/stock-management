"use client"

import { useState, useEffect } from "react"
import type { AuditLogsResponse, AuditLogsFilters } from "@/types/stock"
import { stockApi } from "@/lib/api"

export function useAuditLogs(filters: AuditLogsFilters = {}) {
  const [data, setData] = useState<AuditLogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditLogs = async (newFilters: AuditLogsFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await stockApi.getAuditLogs({ ...filters, ...newFilters })
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audit logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  return {
    data,
    logs: data?.logs || [],
    loading,
    error,
    refetch: fetchAuditLogs,
  }
}
