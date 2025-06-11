"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Building,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { useUsers } from "@/hooks/useUsers"
import type { AuditLogsFilters } from "@/types/stock"
import { stockApi } from "@/lib/api"

const actionLabels: Record<string, string> = {
  assign: "Assigned",
  return: "Returned",
  delete: "Deleted",
  mark_faulty: "Marked Faulty",
  transfer: "Transferred",
  add_stock: "Added Stock",
  update_par_level: "Updated Par Level",
}

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  assign: "default",
  return: "secondary",
  delete: "destructive",
  mark_faulty: "destructive",
  transfer: "outline",
  add_stock: "secondary",
  update_par_level: "outline",
}

export default function AuditLogsPage() {
  const { user, loading: authLoading, hasRole } = useAuth()
  const { users } = useUsers()
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([])

  // Filter state
  const [filters, setFilters] = useState<AuditLogsFilters>({
    page: 1,
    per_page: 50,
  })

  const { data, logs, loading, error, refetch } = useAuditLogs(filters)

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await stockApi.getDepartments()
        setDepartments(depts)
      } catch (err) {
        console.error("Failed to load departments:", err)
      }
    }
    loadDepartments()
  }, [])

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user && !hasRole("admin")) {
      // In a real app, you'd use router.push("/my-equipment")
      console.log("Redirecting non-admin user to /my-equipment")
    }
  }, [user, authLoading, hasRole])

  if (authLoading) {
    return <PageSkeleton />
  }

  if (!user || !hasRole("admin")) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-red-500" />
              <p className="text-lg font-semibold">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-2">
                Only administrators can access audit logs. You will be redirected to your equipment page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFilterChange = (key: keyof AuditLogsFilters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value === "" ? undefined : value,
      page: key !== "page" ? 1 : value, // Reset to page 1 when changing filters
    }
    setFilters(newFilters)
    refetch(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    handleFilterChange("page", newPage)
  }

  const clearFilters = () => {
    const clearedFilters = { page: 1, per_page: 50 }
    setFilters(clearedFilters)
    refetch(clearedFilters)
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error loading audit logs</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track all stock management actions and changes</p>
        </div>
        <Button onClick={() => refetch(filters)} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter audit logs by item, user, department, or action type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="item-id">Stock Item ID</Label>
              <Input
                id="item-id"
                type="number"
                placeholder="Enter item ID..."
                value={filters.item_id || ""}
                onChange={(e) => handleFilterChange("item_id", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-select">User</Label>
              <Select
                value={filters.user_id?.toString() || "all"} // Updated default value to "all"
                onValueChange={(value) => handleFilterChange("user_id", value ? Number(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name || user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-select">Department</Label>
              <Select
                value={filters.department_id?.toString() || "all"} // Updated default value to "all"
                onValueChange={(value) => handleFilterChange("department_id", value ? Number(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-select">Action</Label>
              <Select
                value={filters.action || "all"} // Updated default value to "all"
                onValueChange={(value) => handleFilterChange("action", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
            {data && (
              <p className="text-sm text-muted-foreground">
                Showing {logs.length} of {data.total} results
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>Complete history of all stock management actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Stock Item</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{format(new Date(log.timestamp), "MMM dd, yyyy")}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(log.timestamp), "h:mm a")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionColors[log.action] || "default"}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.stock_item_name}</div>
                            <div className="text-sm text-muted-foreground">ID: {log.stock_item_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.user_name ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{log.user_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.department_name ? (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{log.department_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.performed_by_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={log.reason}>
                            {log.reason || <span className="text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={actionColors[log.action] || "default"}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), "MMM dd, h:mm a")}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium">{log.stock_item_name}</div>
                          <div className="text-sm text-muted-foreground">Item ID: {log.stock_item_id}</div>
                        </div>

                        {log.user_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>User: {log.user_name}</span>
                          </div>
                        )}

                        {log.department_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>Department: {log.department_name}</span>
                          </div>
                        )}

                        <div className="text-sm">
                          <span className="text-muted-foreground">Performed by: </span>
                          <span className="font-medium">{log.performed_by_name}</span>
                        </div>

                        {log.reason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span>{log.reason}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {data.page} of {data.total_pages} ({data.total} total results)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page - 1)}
                      disabled={data.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.page + 1)}
                      disabled={data.page >= data.total_pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
      <p className="text-muted-foreground mb-4">No audit logs match your current filter criteria.</p>
      <p className="text-sm text-muted-foreground">Try adjusting your filters or clearing them to see more results.</p>
    </div>
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

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ))}
    </div>
  )
}
