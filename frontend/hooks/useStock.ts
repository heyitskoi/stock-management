'use client'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { StockItem, AssignStockRequest } from '@/types/stock'
import { apiClient } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export function useStock(departmentId?: number) {
  return useQuery({
    queryKey: ['stock', departmentId],
    queryFn: async (): Promise<StockItem[]> => {
      const query = departmentId ? `?department_id=${departmentId}` : ''
      return apiClient.request(`/stock${query}`, { method: 'GET' })
    },
    enabled: departmentId === undefined || !!departmentId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAssignStock() {
  return useMutation({
    mutationFn: (data: AssignStockRequest) =>
      apiClient.request('/stock/assign', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['stock'])
      queryClient.invalidateQueries(['equipment'])
      queryClient.invalidateQueries(['audit-logs'])
    },
  })
}
