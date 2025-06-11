"use client"

import type React from "react"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: string[]
  fallbackPath?: string
}

export function ProtectedRoute({ children, requiredRoles, fallbackPath = "/my-equipment" }: ProtectedRouteProps) {
  const { user, loading, hasAnyRole } = useAuth()

  useEffect(() => {
    if (!loading && user && !hasAnyRole(requiredRoles)) {
      // User doesn't have required roles - redirect
      window.location.href = fallbackPath
    } else if (!loading && !user) {
      // Not authenticated - redirect to login
      window.location.href = "/login"
    }
  }, [user, loading, hasAnyRole, requiredRoles, fallbackPath])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold">Loading...</p>
              <p className="text-sm text-muted-foreground mt-2">Checking your permissions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (!hasAnyRole(requiredRoles)) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-red-500" />
              <p className="text-lg font-semibold">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">You don't have permission to access this page.</p>
              <p className="text-xs text-muted-foreground mt-1">Required roles: {requiredRoles.join(", ")}</p>
              <Button onClick={() => (window.location.href = fallbackPath)} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
