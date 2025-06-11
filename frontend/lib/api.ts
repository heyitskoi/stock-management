import type {
  StockItem,
  AssignStockRequest,
  MarkFaultyRequest,
  Department,
  MyEquipmentItem,
  UserOption,
  AuditLog,
  AuditLogsResponse,
  AuditLogsFilters,
} from "@/types/stock"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Mock data for preview/development
const mockStockData: StockItem[] = [
  {
    id: 1,
    name: "Dell Laptop XPS 13",
    quantity: 5,
    par_level: 10,
    age_in_days: 45,
    below_par: true,
    department_id: 1,
    status: "available",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    quantity: 12,
    par_level: 8,
    age_in_days: 30,
    below_par: false,
    department_id: 1,
    status: "available",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    quantity: 2,
    par_level: 15,
    age_in_days: 120,
    below_par: true,
    department_id: 1,
    status: "available",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: 4,
    name: "Monitor 27 inch",
    quantity: 8,
    par_level: 5,
    age_in_days: 60,
    below_par: false,
    department_id: 1,
    status: "available",
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z",
  },
]

// Mock equipment data for preview/development
const mockEquipmentData: MyEquipmentItem[] = [
  {
    id: 1,
    name: "MacBook Pro 16-inch",
    department: "IT Department",
    assigned_at: "2024-01-15T09:30:00Z",
    is_faulty: false,
    serial_number: "MBP2024001",
    category: "Laptop",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    department: "IT Department",
    assigned_at: "2024-01-20T14:15:00Z",
    is_faulty: false,
    serial_number: "IP15001",
    category: "Mobile Device",
  },
  {
    id: 3,
    name: "Wireless Headset",
    department: "IT Department",
    assigned_at: "2024-01-10T11:45:00Z",
    is_faulty: true,
    serial_number: "WH2024003",
    category: "Audio Equipment",
  },
]

// Mock users data for preview/development
const mockUsersData: UserOption[] = [
  {
    id: 1,
    username: "john_doe",
    email: "john.doe@company.com",
    full_name: "John Doe",
    role: "tech_support",
    department_name: "IT Department",
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane.smith@company.com",
    full_name: "Jane Smith",
    role: "sales",
    department_name: "Sales Department",
  },
  {
    id: 3,
    username: "mike_wilson",
    email: "mike.wilson@company.com",
    full_name: "Mike Wilson",
    role: "tech_support",
    department_name: "IT Department",
  },
  {
    id: 4,
    username: "sarah_johnson",
    email: "sarah.johnson@company.com",
    full_name: "Sarah Johnson",
    role: "admin",
    department_name: "Administration",
  },
  {
    id: 5,
    username: "david_brown",
    email: "david.brown@company.com",
    full_name: "David Brown",
    role: "warehouse",
    department_name: "Warehouse",
  },
]

// Mock audit logs data for preview/development
const mockAuditLogsData: AuditLog[] = [
  {
    id: 1,
    timestamp: "2024-01-25T14:30:00Z",
    action: "assign",
    reason: "New employee setup",
    stock_item_id: 1,
    stock_item_name: "Dell Laptop XPS 13",
    user_id: 1,
    user_name: "John Doe",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_assigned: 1 },
  },
  {
    id: 2,
    timestamp: "2024-01-25T13:15:00Z",
    action: "mark_faulty",
    reason: "Screen flickering issue",
    stock_item_id: 3,
    stock_item_name: "Wireless Headset",
    user_id: 3,
    user_name: "Mike Wilson",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
  },
  {
    id: 3,
    timestamp: "2024-01-25T11:45:00Z",
    action: "return",
    reason: "Employee departure",
    stock_item_id: 2,
    stock_item_name: "iPhone 15 Pro",
    user_id: 2,
    user_name: "Jane Smith",
    department_id: 1,
    department_name: "Sales Department",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_returned: 1 },
  },
  {
    id: 4,
    timestamp: "2024-01-25T10:20:00Z",
    action: "add_stock",
    reason: "Monthly restock",
    stock_item_id: 4,
    stock_item_name: "Monitor 27 inch",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 5,
    performed_by_name: "David Brown",
    details: { quantity_added: 5 },
  },
  {
    id: 5,
    timestamp: "2024-01-25T09:30:00Z",
    action: "transfer",
    reason: "Department reorganization",
    stock_item_id: 1,
    stock_item_name: "Dell Laptop XPS 13",
    department_id: 2,
    department_name: "IT Department",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
    details: { from_department: "Warehouse", to_department: "IT Department", quantity: 2 },
  },
  {
    id: 6,
    timestamp: "2024-01-24T16:45:00Z",
    action: "update_par_level",
    reason: "Increased demand forecast",
    stock_item_id: 3,
    stock_item_name: "Wireless Mouse",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 4,
    performed_by_name: "Sarah Johnson",
    details: { old_par_level: 10, new_par_level: 15 },
  },
  {
    id: 7,
    timestamp: "2024-01-24T15:20:00Z",
    action: "delete",
    reason: "Obsolete equipment",
    stock_item_id: 99,
    stock_item_name: "Old CRT Monitor",
    department_id: 1,
    department_name: "Warehouse",
    performed_by_id: 5,
    performed_by_name: "David Brown",
  },
]

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // For preview/development, return mock data
  if (endpoint.includes("/stock")) {
    return mockStockData as T
  }

  // In production, use real API
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`)
  }

  return response.json()
}

export const stockApi = {
  getStock: async (departmentId?: number): Promise<StockItem[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
    return mockStockData.filter((item) => !departmentId || item.department_id === departmentId)
  },

  assignStock: async (data: AssignStockRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "User is not eligible for this equipment type")
    }

    return {
      success: true,
      message: "Stock item assigned successfully",
      assignment_id: Math.floor(Math.random() * 1000),
    }
  },

  markFaulty: async (data: MarkFaultyRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  deleteStock: async (itemId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  getDepartments: async (): Promise<Department[]> => {
    return [
      { id: 1, name: "Warehouse", tenant_id: 1 },
      { id: 2, name: "IT Department", tenant_id: 1 },
      { id: 3, name: "Sales Department", tenant_id: 1 },
      { id: 4, name: "Administration", tenant_id: 1 },
    ]
  },

  getMyEquipment: async (): Promise<MyEquipmentItem[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
    return mockEquipmentData
  },

  getUsers: async (): Promise<UserOption[]> => {
    // Return mock data for preview
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate loading
    return mockUsersData
  },

  getAuditLogs: async (filters: AuditLogsFilters = {}): Promise<AuditLogsResponse> => {
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1200))

    let filteredLogs = [...mockAuditLogsData]

    // Apply filters
    if (filters.item_id) {
      filteredLogs = filteredLogs.filter((log) => log.stock_item_id === filters.item_id)
    }
    if (filters.user_id) {
      filteredLogs = filteredLogs.filter((log) => log.user_id === filters.user_id)
    }
    if (filters.department_id) {
      filteredLogs = filteredLogs.filter((log) => log.department_id === filters.department_id)
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === filters.action)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const page = filters.page || 1
    const perPage = filters.per_page || 50
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(filteredLogs.length / perPage),
    }
  },

  returnItem: async (data: { item_id: number; reason: string; condition: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Simulate potential errors for testing
    if (Math.random() < 0.1) {
      // 10% chance of error for testing
      throw new ApiError(400, "Item cannot be returned at this time")
    }

    return {
      success: true,
      message: "Item returned successfully",
      return_id: Math.floor(Math.random() * 1000),
    }
  },
}
