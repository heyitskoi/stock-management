"use client"

import type React from "react"

import { useState } from "react"
import { Save, RefreshCw, Building, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"

interface SettingsFormProps {
  title: string
  description: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  loading?: boolean
}

function SettingsForm({ title, description, children, onSubmit, loading = false }: SettingsFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button disabled={loading}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function GeneralSettings() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    companyName: "Acme Corporation",
    defaultParLevel: "10",
    lowStockThreshold: "20",
    enableNotifications: true,
    defaultDepartment: "1",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("General settings saved successfully!")
    setLoading(false)
  }

  return (
    <SettingsForm
      title="General Settings"
      description="Configure system-wide settings for your stock management"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={settings.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-par-level">Default Par Level</Label>
            <Input
              id="default-par-level"
              type="number"
              value={settings.defaultParLevel}
              onChange={(e) => handleChange("defaultParLevel", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Default minimum stock level for new items</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="low-stock-threshold">Low Stock Warning (%)</Label>
            <Input
              id="low-stock-threshold"
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Percentage below par level to trigger warnings</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-department">Default Department</Label>
          <Select
            value={settings.defaultDepartment}
            onValueChange={(value) => handleChange("defaultDepartment", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Warehouse</SelectItem>
              <SelectItem value="2">IT Department</SelectItem>
              <SelectItem value="3">Sales Department</SelectItem>
              <SelectItem value="4">Administration</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Default department for new stock items</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Email Notifications</Label>
            <p className="text-xs text-muted-foreground">Receive alerts for low stock and pending requests</p>
          </div>
          <Switch
            id="notifications"
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
          />
        </div>
      </div>
    </SettingsForm>
  )
}

function DepartmentSettings() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Department settings saved successfully!")
    setLoading(false)
  }

  return (
    <SettingsForm
      title="Department Settings"
      description="Configure departments and their stock management rules"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-6">
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Warehouse</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Main storage location • 4 stock managers • 120 items
            </div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">IT Department</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Tech equipment • 2 stock managers • 45 items</div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Sales Department</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Sales materials • 1 stock manager • 28 items</div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Building className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>
    </SettingsForm>
  )
}

function StockCategoriesSettings() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Stock category settings saved successfully!")
    setLoading(false)
  }

  return (
    <SettingsForm
      title="Stock Categories"
      description="Manage stock categories and their default settings"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-6">
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Electronics</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Default par level: 5 • Aging threshold: 365 days</div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Office Supplies</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Default par level: 20 • Aging threshold: 180 days</div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Furniture</h3>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Default par level: 2 • Aging threshold: 730 days</div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Package className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>
    </SettingsForm>
  )
}

function SettingsPageContent() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="categories">Stock Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <DepartmentSettings />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <StockCategoriesSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <MainLayout title="Settings" subtitle="Configure your stock management system">
        <SettingsPageContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
