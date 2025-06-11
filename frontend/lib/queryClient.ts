import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './errorHandler'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) {
          return false
        }
        return failureCount < 3
      }
    }
  }
})
