"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

interface AddTransactionButtonProps {
  onClick: () => void
}
export function AddTransactionButton({ onClick }: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false)


  return (
    <>
      <Button onClick={onClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
      {/* <AddTransactionDialog
        open={open}
        onOpenChange={setOpen}
        onAdd={() => {
          // This will be handled by the parent component
          // setOpen(false)
        }}
      /> */}
    </>
  )
}
