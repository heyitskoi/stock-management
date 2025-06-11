import { z } from 'zod'

export const assignStockSchema = z.object({
  stock_item_id: z.number().positive(),
  assignee_user_id: z.number().positive(),
  reason: z.string().max(500).optional()
})

export const returnItemSchema = z.object({
  item_id: z.number().positive(),
  reason: z.string().min(1).max(500),
  condition: z.enum(['good', 'damaged', 'lost'])
})

export const markFaultySchema = z.object({
  item_id: z.number().positive(),
  reason: z.string().min(1).max(500)
})
