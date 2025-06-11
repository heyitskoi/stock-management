'use client'
import { useEffect } from 'react'
import { wsManager } from '@/lib/websocket'
import { useAuth } from './useAuth'
import { queryClient } from '@/lib/queryClient'

export function useRealTimeUpdates() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      wsManager.connect(user.id)

      const handleStockUpdate = (event: CustomEvent) => {
        queryClient.invalidateQueries(['stock'])
        queryClient.invalidateQueries(['equipment'])
        queryClient.invalidateQueries(['audit-logs'])
      }

      window.addEventListener('stock-update', handleStockUpdate as any)

      return () => {
        window.removeEventListener('stock-update', handleStockUpdate as any)
        wsManager.disconnect()
      }
    }
  }, [user])
}
