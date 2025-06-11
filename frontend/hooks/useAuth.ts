"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/stock"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock user data for preview - simulating a user with multiple roles
    const mockUser: User = {
      id: 1,
      username: "john_manager",
      email: "john.manager@company.com",
      roles: ["stock_manager", "staff"], // User can manage stock AND has personal equipment
      department_id: 2,
      full_name: "John Manager",
    }

    // Simulate loading delay
    setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 500)
  }, [])

  const hasRole = (role: string) => user?.roles?.includes(role) || false

  const hasAnyRole = (roles: string[]) => roles.some((role) => hasRole(role))

  const getPrimaryRole = () => {
    if (!user?.roles?.length) return null

    // Priority order for determining primary role
    const rolePriority = ["admin", "stock_manager", "staff", "viewer"]

    for (const role of rolePriority) {
      if (user.roles.includes(role)) {
        return role
      }
    }

    return user.roles[0] // Fallback to first role
  }

  return { user, loading, hasRole, hasAnyRole, getPrimaryRole }
}
