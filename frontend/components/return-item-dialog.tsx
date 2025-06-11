"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { stockApi } from "@/lib/api"
import type { MyEquipmentItem } from "@/types/stock"

interface ReturnItemDialogProps {
  item: MyEquipmentItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ReturnItemDialog({ item, open, onOpenChange, onSuccess }: ReturnItemDialogProps) {
  const [reason, setReason] = useState("")
  const [condition, setCondition] = useState<"good" | "damaged" | "lost">("good")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    try {
      setLoading(true)
      setError(null)

      // In a real app, this would call the API
      await stockApi.returnItem({
        item_id: item.id,
        reason: reason.trim() || "Standard return",
        condition,
      })

      // Show success message
      if (typeof window !== "undefined") {
        alert(`Success: ${item.name} has been returned successfully.`)
      }

      onSuccess()
      onOpenChange(false)
      setReason("")
      setCondition("good")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to return item"
      setError(errorMessage)

      // Also show error toast
      if (typeof window !== "undefined") {
        alert(`Error: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Return Equipment</DialogTitle>
          <DialogDescription>Return "{item?.name}" to inventory. This action will be logged.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item?.name}</p>
                <p className="text-sm text-muted-foreground">Department: {item?.department}</p>
              </div>
              {item?.is_faulty && (
                <Badge variant="destructive" className="text-xs">
                  Faulty
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Assigned: {item?.assigned_at ? format(new Date(item.assigned_at), "MMM dd, yyyy") : "Unknown"}
              </span>
            </div>
          </div>

          {/* Condition Selection */}
          <div className="space-y-2">
            <Label>Item Condition</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={condition === "good" ? "default" : "outline"}
                size="sm"
                onClick={() => setCondition("good")}
              >
                Good Condition
              </Button>
              <Button
                type="button"
                variant={condition === "damaged" ? "default" : "outline"}
                size="sm"
                onClick={() => setCondition("damaged")}
              >
                Damaged
              </Button>
              <Button
                type="button"
                variant={condition === "lost" ? "default" : "outline"}
                size="sm"
                onClick={() => setCondition("lost")}
              >
                Lost/Missing
              </Button>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Return Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Project completed, equipment no longer needed, etc."
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
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Returning...
                </>
              ) : (
                "Return Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
