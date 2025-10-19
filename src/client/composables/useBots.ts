import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ApiResponse, Bot } from '../../shared/types/index'

// Query for fetching all bots
export const useBots = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: async (): Promise<Bot[]> => {
      const response = await fetch('/api/bots')
      const result: ApiResponse<Bot[]> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data!
    },
    refetchInterval: 60000, // Auto-refresh every minute
    retry: 3,
    retryDelay: 1000
  })
}

// Mutation for creating a new bot
export const useCreateBot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (botData: { name: string; pair: string; desired_direction: number }): Promise<Bot> => {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      })
      
      const result: ApiResponse<Bot> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data!
    },
    onSuccess: () => {
      // Invalidate and refetch bots after creating
      queryClient.invalidateQueries({ queryKey: ['bots'] })
    },
  })
}

// Mutation for updating a bot
export const useUpdateBot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...botData }: Partial<Bot> & { id: string }): Promise<Bot> => {
      const response = await fetch(`/api/bots/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      })
      
      const result: ApiResponse<Bot> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data!
    },
    onSuccess: () => {
      // Invalidate and refetch bots after updating
      queryClient.invalidateQueries({ queryKey: ['bots'] })
    },
  })
}

// Mutation for deleting a bot
export const useDeleteBot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const result: ApiResponse<null> = await response.json()
        throw new Error(result.error || 'Failed to delete bot')
      }
    },
    onSuccess: () => {
      // Invalidate and refetch bots after deleting
      queryClient.invalidateQueries({ queryKey: ['bots'] })
    },
  })
}

// Mutation for exiting a bot (setting desired_direction to 0)
export const useExitBot = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<Bot> => {
      const response = await fetch(`/api/bots/${id}/exit`, {
        method: 'POST',
      })
      
      const result: ApiResponse<Bot> = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result.data!
    },
    onSuccess: () => {
      // Invalidate and refetch bots after exiting
      queryClient.invalidateQueries({ queryKey: ['bots'] })
    },
  })
}
