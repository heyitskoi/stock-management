"use client"

import type React from "react"

import { useState } from "react"
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
import { stockApi } from "@/lib/api"
import type { StockItem } from "@/types/stock"

interface MarkFaultyDialogProps {
  item: StockItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MarkFaultyDialog({ item, open, onOpenChange, onSuccess }: MarkFaultyDialogProps) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !reason.trim()) return

    try {
      setLoading(true)
      await stockApi.markFaulty({
        item_id: item.id,
        reason: reason.trim(),
      })

      alert(`Success: ${item.name} has been marked as faulty.`)

      onSuccess()
      onOpenChange(false)
      setReason("")
    } catch (error) {
      alert("Error: Failed to mark item as faulty.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Item as Faulty</DialogTitle>
          <DialogDescription>Mark "{item?.name}" as faulty. Please provide a reason for this action.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="col-span-3"
                placeholder="Describe the issue..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !reason.trim()} variant="destructive">
              {loading ? "Marking..." : "Mark as Faulty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
