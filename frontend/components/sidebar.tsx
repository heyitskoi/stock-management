"use client"
import { Package, Users, FileText, RotateCcw, UserCheck, Settings, Home, ChevronDown, LogOut, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import type { NavItem } from "@/types/stock"

// Define navigation items with role requirements
const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and quick actions",
    requiredRoles: ["stock_manager", "admin"],
  },
  {
    title: "Department Stock",
    href: "/department-dashboard",
    icon: Package,
    description: "Manage department inventory",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "My Equipment",
    href: "/my-equipment",
    icon: UserCheck,
    description: "View your assigned items",
    requiredRoles: ["staff"],
  },
  {
    title: "Assign Items",
    href: "/assign",
    icon: Users,
    description: "Assign stock to users",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "Return Items",
    href: "/return",
    icon: RotateCcw,
    description: "Process equipment returns",
    requiredRoles: ["stock_manager"],
  },
  {
    title: "Audit Logs",
    href: "/audit/logs",
    icon: FileText,
    description: "View system audit trail",
    requiredRoles: ["admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
    requiredRoles: ["admin"],
  },
]

export function AppSidebar() {
  const { user, hasAnyRole } = useAuth()

  // Filter navigation items based on user roles
  const visibleNavItems = navigationItems.filter((item) => hasAnyRole(item.requiredRoles))

  const handleLogout = () => {
    // In a real app, you'd clear tokens and redirect
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    window.location.href = "/login"
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Package className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">Stock Manager</h2>
            <p className="text-xs text-muted-foreground">Inventory System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <a href={item.href} className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4" />
                        <div className="flex-1">
                          <div>{item.title}</div>
                          {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Information */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Roles</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2 space-y-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role.replace("_", " ").toUpperCase()}
                  </Badge>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <User className="h-4 w-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user?.full_name || user?.username}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
