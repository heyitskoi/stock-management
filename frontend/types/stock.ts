import type React from "react"
export interface StockItem {
  id: number
  name: string
  quantity: number
  par_level: number
  age_in_days: number
  below_par: boolean
  department_id: number
  assigned_to?: string
  status: "available" | "assigned" | "faulty" | "deleted"
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  name: string
  tenant_id: number
}

export interface User {
  id: number
  username: string
  email: string
  roles: string[] // Changed to array of roles
  department_id?: number
  full_name?: string
}

export interface AssignStockRequest {
  stock_item_id: number
  assignee_user_id: number
  reason?: string
}

export interface MarkFaultyRequest {
  item_id: number
  reason: string
}

export interface MyEquipmentItem {
  id: number
  name: string
  department: string
  assigned_at: string
  is_faulty: boolean
  serial_number?: string
  category?: string
}

export interface UserOption {
  id: number
  username: string
  email: string
  full_name?: string
  roles: string[]
  department_name?: string
}

export interface AuditLog {
  id: number
  timestamp: string
  action: "assign" | "return" | "delete" | "mark_faulty" | "transfer" | "add_stock" | "update_par_level"
  reason?: string
  stock_item_id: number
  stock_item_name?: string
  user_id?: number
  user_name?: string
  department_id?: number
  department_name?: string
  performed_by_id: number
  performed_by_name: string
  details?: Record<string, any>
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface AuditLogsFilters {
  item_id?: number
  user_id?: number
  department_id?: number
  action?: string
  page?: number
  per_page?: number
}

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  requiredRoles: string[]
}
