"use client"

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
import { stockApi } from "@/lib/api"
import type { StockItem } from "@/types/stock"

interface DeleteConfirmationDialogProps {
  item: StockItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteConfirmationDialog({ item, open, onOpenChange, onSuccess }: DeleteConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!item) return

    try {
      setLoading(true)
      await stockApi.deleteStock(item.id)

      alert(`Success: ${item.name} has been deleted.`)

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      alert("Error: Failed to delete stock item.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Stock Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{item?.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={loading} variant="destructive">
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
