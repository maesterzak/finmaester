"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "@/components/ui/chart"
import { Download, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MonthlyReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MonthlyReportDialog({ open, onOpenChange }: MonthlyReportDialogProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Mock data for the pie chart
  const data = [
    { name: "Investment", value: 25, color: "#8884d8" },
    { name: "Savings", value: 15, color: "#82ca9d" },
    { name: "Transport", value: 20, color: "#ffc658" },
    { name: "Education", value: 15, color: "#ff8042" },
    { name: "Personal", value: 25, color: "#0088fe" },
  ]

  const handleDownload = () => {
    setIsDownloading(true)

    // Simulate download
    setTimeout(() => {
      setIsDownloading(false)
      toast({
        title: "Report downloaded",
        description: "Your monthly report has been downloaded successfully.",
      })
    }, 1500)
  }

  const handleShare = () => {
    setIsSharing(true)

    // Simulate sharing
    setTimeout(() => {
      setIsSharing(false)
      toast({
        title: "Report shared",
        description: "Your monthly report has been shared successfully.",
      })
      onOpenChange(false)
    }, 1500)
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Monthly Expense Report</DialogTitle>
          <DialogDescription>
            {currentMonth} {currentYear} expense breakdown by category
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">Total Expenses: $2,150.75</div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownload} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download Report"}
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleShare} disabled={isSharing}>
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Sharing..." : "Share Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
