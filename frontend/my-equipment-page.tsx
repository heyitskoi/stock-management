"use client"

import { format } from "date-fns"
import { AlertTriangle, Package, Smartphone, Headphones, Monitor, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { useMyEquipment } from "@/hooks/useMyEquipment"

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "laptop":
    case "computer":
      return Monitor
    case "mobile device":
    case "phone":
      return Smartphone
    case "audio equipment":
    case "headset":
      return Headphones
    default:
      return Package
  }
}

export default function MyEquipmentPage() {
  const { user, loading: authLoading } = useAuth()
  const { equipment, loading: equipmentLoading, error, refetch } = useMyEquipment()

  if (authLoading) {
    return <PageSkeleton />
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold">Authentication Required</p>
              <p className="text-sm text-muted-foreground mt-2">Please log in to view your equipment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error loading equipment</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={refetch} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const faultyItems = equipment.filter((item) => item.is_faulty)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Equipment</h1>
          <p className="text-muted-foreground">View all equipment currently assigned to you</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
            <p className="text-xs text-muted-foreground">Items assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faulty Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{faultyItems.length}</div>
            <p className="text-xs text-muted-foreground">Items needing attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{equipment.length - faultyItems.length}</div>
            <p className="text-xs text-muted-foreground">Items in good condition</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Content */}
      {equipmentLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : equipment.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
              <CardDescription>All equipment currently assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Serial Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => {
                    const IconComponent = getCategoryIcon(item.category)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.category && <div className="text-sm text-muted-foreground">{item.category}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>
                          {format(new Date(item.assigned_at), "MMM dd, yyyy")}
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(item.assigned_at), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.is_faulty ? "destructive" : "secondary"}>
                            {item.is_faulty ? (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Faulty
                              </>
                            ) : (
                              "Working"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.serial_number || "N/A"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {equipment.map((item) => {
              const IconComponent = getCategoryIcon(item.category)
              return (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          {item.category && <p className="text-sm text-muted-foreground">{item.category}</p>}
                        </div>
                      </div>
                      <Badge variant={item.is_faulty ? "destructive" : "secondary"}>
                        {item.is_faulty ? (
                          <>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Faulty
                          </>
                        ) : (
                          "Working"
                        )}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Department:</span>
                        <span>{item.department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assigned:</span>
                        <span>{format(new Date(item.assigned_at), "MMM dd, yyyy")}</span>
                      </div>
                      {item.serial_number && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Serial:</span>
                          <span className="font-mono">{item.serial_number}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Equipment Assigned</h3>
          <p className="text-muted-foreground mb-4">You don't have any equipment assigned to you at the moment.</p>
          <p className="text-sm text-muted-foreground">
            Contact your department manager if you need equipment assigned.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function PageSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
