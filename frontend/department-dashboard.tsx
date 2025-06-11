"use client"

import { useState } from "react"
import { AlertTriangle, MoreHorizontal, Package, Users, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { useStock } from "@/hooks/useStock"
import type { StockItem } from "@/types/stock"
import { MarkFaultyDialog } from "@/components/mark-faulty-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { AssignItemDialog } from "@/components/assign-item-dialog"

export default function DepartmentDashboard() {
  // For preview, we'll use department_id = 1
  const departmentId = 1

  const { user, loading: authLoading, hasRole } = useAuth()
  const { stock, loading: stockLoading, error, refetch } = useStock(departmentId)

  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [faultyDialogOpen, setFaultyDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (authLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-semibold">Authentication Required</p>
              <p className="text-sm text-muted-foreground mt-2">Please log in to access the dashboard</p>
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
              <p className="text-lg font-semibold">Error loading stock data</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const belowParItems = stock.filter((item) => item.below_par)
  const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0)
  const averageAge =
    stock.length > 0 ? Math.round(stock.reduce((sum, item) => sum + item.age_in_days, 0) / stock.length) : 0

  const handleAction = (action: "assign" | "faulty" | "delete", item: StockItem) => {
    setSelectedItem(item)
    switch (action) {
      case "assign":
        setAssignDialogOpen(true)
        break
      case "faulty":
        setFaultyDialogOpen(true)
        break
      case "delete":
        setDeleteDialogOpen(true)
        break
    }
  }

  const handleDialogSuccess = () => {
    refetch()
    setSelectedItem(null)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Dashboard</h1>
          <p className="text-muted-foreground">Manage stock for your department</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stock.length}</div>
            <p className="text-xs text-muted-foreground">Stock items in department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Below Par Level</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{belowParItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAge}</div>
            <p className="text-xs text-muted-foreground">Days in inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
          <CardDescription>Manage and track all stock items in your department</CardDescription>
        </CardHeader>
        <CardContent>
          {stockLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Par Level</TableHead>
                  <TableHead>Age (Days)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.below_par && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.par_level}</TableCell>
                    <TableCell>{item.age_in_days}</TableCell>
                    <TableCell>
                      <Badge variant={item.below_par ? "destructive" : "secondary"}>
                        {item.below_par ? "Below Par" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("assign", item)}>
                            Assign to User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("faulty", item)}>
                            Mark as Faulty
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("delete", item)} className="text-red-600">
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssignItemDialog
        item={selectedItem}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <MarkFaultyDialog
        item={selectedItem}
        open={faultyDialogOpen}
        onOpenChange={setFaultyDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <DeleteConfirmationDialog
        item={selectedItem}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  )
}
