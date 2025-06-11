"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, User, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { stockApi } from "@/lib/api"
import { useUsers } from "@/hooks/useUsers"
import type { StockItem } from "@/types/stock"

interface AssignItemDialogProps {
  item: StockItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AssignItemDialog({ item, open, onOpenChange, onSuccess }: AssignItemDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  const { users, loading: usersLoading, error: usersError } = useUsers()

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedUserId(null)
      setReason("")
      setError(null)
      setUserSelectOpen(false)
    }
  }, [open])

  const selectedUser = users.find((user) => user.id === selectedUserId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!item || !selectedUserId) {
      setError("Please select a user to assign the item to")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await stockApi.assignStock({
        stock_item_id: item.id,
        assignee_user_id: selectedUserId,
        reason: reason.trim() || undefined,
      })

      // Show success message
      if (typeof window !== "undefined") {
        // In a real app, you'd use a proper toast system
        alert(`Success: ${item.name} has been assigned to ${selectedUser?.full_name || selectedUser?.username}`)
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign stock item"
      setError(errorMessage)

      // Also show error toast
      if (typeof window !== "undefined") {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = selectedUserId !== null && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Stock Item</DialogTitle>
          <DialogDescription>
            Assign "{item?.name}" to a user. This action will be logged and tracked.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item?.name}</p>
                <p className="text-sm text-muted-foreground">Quantity available: {item?.quantity}</p>
              </div>
              {item?.below_par && (
                <Badge variant="destructive" className="text-xs">
                  Below Par
                </Badge>
              )}
            </div>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Assign to User *</Label>

            {usersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load users: {usersError}</AlertDescription>
              </Alert>
            ) : usersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSelectOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedUser ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedUser.full_name || selectedUser.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedUser.role}
                        </Badge>
                      </div>
                    ) : (
                      "Select user..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.username} ${user.full_name} ${user.email}`}
                            onSelect={() => {
                              setSelectedUserId(user.id)
                              setUserSelectOpen(false)
                              setError(null) // Clear error when user selects
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", selectedUserId === user.id ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.full_name || user.username}</span>
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                                {user.department_name && ` • ${user.department_name}`}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {selectedUser && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedUser.full_name || selectedUser.username} ({selectedUser.email})
                {selectedUser.department_name && ` from ${selectedUser.department_name}`}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Assignment (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Replacement for damaged equipment, new employee setup, temporary assignment..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{reason.length}/500 characters</div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid} className="min-w-[100px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
