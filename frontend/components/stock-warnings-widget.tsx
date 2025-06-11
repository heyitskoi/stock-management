"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingDown, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface StockWarning {
  id: number
  name: string
  warning_type: "below_par" | "aging" | "faulty"
  department_name: string
  quantity: number
  par_level?: number
  age_in_days?: number
  details?: string
}

export function StockWarningsWidget() {
  const [warnings, setWarnings] = useState<StockWarning[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWarnings = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, this would call the API
      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockWarnings: StockWarning[] = [
        {
          id: 1,
          name: "Dell Laptop XPS 13",
          warning_type: "below_par",
          department_name: "IT Department",
          quantity: 2,
          par_level: 5,
          details: "3 units below minimum level",
        },
        {
          id: 2,
          name: "Wireless Mouse",
          warning_type: "below_par",
          department_name: "Sales Department",
          quantity: 3,
          par_level: 10,
          details: "7 units below minimum level",
        },
        {
          id: 3,
          name: "HP Printer Toner",
          warning_type: "aging",
          department_name: "Administration",
          quantity: 5,
          age_in_days: 365,
          details: "Stock over 12 months old",
        },
        {
          id: 4,
          name: "Wireless Headset",
          warning_type: "faulty",
          department_name: "IT Department",
          quantity: 3,
          details: "Multiple units reported faulty",
        },
      ]

      setWarnings(mockWarnings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch warnings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarnings()
  }, [])

  const getWarningIcon = (type: string) => {
    switch (type) {
      case "below_par":
        return <TrendingDown className="h-4 w-4" />
      case "aging":
        return <Clock className="h-4 w-4" />
      case "faulty":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getWarningLabel = (type: string) => {
    switch (type) {
      case "below_par":
        return "Below Par"
      case "aging":
        return "Aging Stock"
      case "faulty":
        return "Faulty Items"
      default:
        return "Warning"
    }
  }

  const getWarningVariant = (type: string): "destructive" | "outline" | "secondary" => {
    switch (type) {
      case "below_par":
        return "destructive"
      case "aging":
        return "secondary"
      case "faulty":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Error loading warnings</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchWarnings} variant="outline" size="sm" className="mt-2">
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (warnings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="font-semibold text-green-600">All Stock Levels Normal</p>
            <p className="text-sm text-muted-foreground mt-1">No warnings to display</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Stock Warnings
        </CardTitle>
        <CardDescription>Items requiring attention across departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {warnings.map((warning) => (
            <div key={warning.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{warning.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {warning.department_name} • {warning.details}
                </div>
              </div>
              <Badge variant={getWarningVariant(warning.warning_type)} className="flex items-center gap-1">
                {getWarningIcon(warning.warning_type)}
                {getWarningLabel(warning.warning_type)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={fetchWarnings}>
          <RefreshCw className="mr-2 h-3 w-3" />
          Refresh Warnings
        </Button>
      </CardFooter>
    </Card>
  )
}
