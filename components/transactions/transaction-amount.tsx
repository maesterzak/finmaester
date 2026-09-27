import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/formatCurrency"
import type { Transaction } from "@/lib/firebase/firestore"

const styles: Record<Transaction["type"], { sign: string; className: string }> = {
  income: { sign: "+", className: "text-emerald-500" },
  expense: { sign: "-", className: "text-red-500" },
  investment: { sign: "", className: "text-blue-500" },
}

export function TransactionAmount({ transaction, className }: { transaction: Transaction; className?: string }) {
  const style = styles[transaction.type] ?? styles.expense
  return (
    <span className={cn("font-semibold whitespace-nowrap", style.className, className)}>
      {style.sign}
      {formatCurrency(Number(transaction.amount) || 0)}
    </span>
  )
}
