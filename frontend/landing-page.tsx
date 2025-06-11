"use client"

import { useEffect } from "react"
import { Loader2, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function LandingPage() {
  const { user, loading, hasRole } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      // Role-based routing logic
      if (hasRole("stock_manager")) {
        // Stock managers go to department dashboard
        window.location.href = "/department-dashboard"
      } else if (hasRole("admin") && !hasRole("stock_manager") && !hasRole("staff")) {
        // Admin-only users go to audit logs
        window.location.href = "/audit/logs"
      } else if (hasRole("staff")) {
        // Staff members go to their equipment
        window.location.href = "/my-equipment"
      } else {
        // No valid role - redirect to login
        window.location.href = "/login"
      }
    } else if (!loading && !user) {
      // Not authenticated - redirect to login
      window.location.href = "/login"
    }
  }, [user, loading, hasRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Package className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Stock Management System</h1>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Checking your permissions...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // This should not render as user will be redirected
  return null
}
