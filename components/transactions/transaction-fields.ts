import type { Transaction } from "@/lib/firebase/firestore"

type TransactionFields = Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">

// Maps AddTransactionDialog output to the fields stored in Firestore.
// Firestore rejects undefined values, so optional investment fields are only included when set.
export function toTransactionFields(tx: any): TransactionFields {
  const fields: TransactionFields = {
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    categoryId: tx.categoryId,
    categoryName: tx.category,
    date: tx.date,
  }
  if (tx.type === "investment") {
    for (const key of ["assetName", "assetType", "units", "unitPrice", "investmentAccountId", "investmentTokenId"] as const) {
      if (tx[key] !== undefined && tx[key] !== "") (fields as any)[key] = tx[key]
    }
  }
  return fields
}
