"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddCategoryButtonProps {
  onClick: () => void
}

export function AddCategoryButton({ onClick }: AddCategoryButtonProps) {
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      Add Category
    </Button>
  )
}
