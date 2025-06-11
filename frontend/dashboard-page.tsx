"use client"
import { Package, Users, TrendingDown, Clock, BarChart3, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { StockWarningsWidget } from "@/components/stock-warnings-widget"
import { useStock } from "@/hooks/useStock"

function DashboardContent() {
  const { stock } = useStock()

  // Calculate summary statistics
  const totalItems = stock.length
  const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0)
  const belowParItems = stock.filter((item) => item.below_par).length
  const averageAge =
    stock.length > 0 ? Math.round(stock.reduce((sum, item) => sum + item.age_in_days, 0) / stock.length) : 0

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique stock items</p>
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
            <div className="text-2xl font-bold text-red-600">{belowParItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAge}</div>
            <p className="text-xs text-muted-foreground">Days in inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock Warnings */}
        <StockWarningsWidget />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest stock movements and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="font-medium">Dell Laptop XPS 13 assigned to John Doe</p>
                <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <p className="font-medium">5 Wireless Mouse added to inventory</p>
                <p className="text-sm text-muted-foreground">Yesterday at 2:15 PM</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-1">
                <p className="font-medium">Wireless Headset marked as faulty</p>
                <p className="text-sm text-muted-foreground">Yesterday at 11:45 AM</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-1">
                <p className="font-medium">iPhone 15 Pro transferred to Sales Department</p>
                <p className="text-sm text-muted-foreground">Jan 24, 2024 at 9:20 AM</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Activity
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col py-4 justify-start items-start text-left">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 mr-2" />
                <span className="font-medium">Add New Stock</span>
              </div>
              <p className="text-xs text-muted-foreground">Add new items to inventory</p>
            </Button>

            <Button variant="outline" className="h-auto flex-col py-4 justify-start items-start text-left">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Assign Equipment</span>
              </div>
              <p className="text-xs text-muted-foreground">Assign items to staff members</p>
            </Button>

            <Button variant="outline" className="h-auto flex-col py-4 justify-start items-start text-left">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-5 w-5 mr-2" />
                <span className="font-medium">Generate Report</span>
              </div>
              <p className="text-xs text-muted-foreground">Create inventory reports</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["stock_manager", "admin"]}>
      <MainLayout title="Dashboard" subtitle="Overview of your stock management system">
        <DashboardContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
