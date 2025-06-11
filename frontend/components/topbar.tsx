"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

interface TopbarProps {
  title?: string
  subtitle?: string
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  const { user, getPrimaryRole } = useAuth()

  const primaryRole = getPrimaryRole()
  const roleDisplayName = primaryRole?.replace("_", " ").toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
          {primaryRole && (
            <Badge variant="outline" className="text-xs">
              {roleDisplayName}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." className="w-64 pl-8" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
        </Button>

        {/* User info */}
        <div className="hidden md:block text-right">
          <div className="text-sm font-medium">{user?.full_name || user?.username}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>
    </header>
  )
}
