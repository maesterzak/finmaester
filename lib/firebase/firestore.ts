import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  writeBatch,
} from "firebase/firestore"
import { db } from "./config"
import { tr } from "date-fns/locale"

// Types
export interface Transaction {
  id?: string
  userId: string
  type: "income" | "expense"
  amount: number
  description: string
  categoryId: string
  categoryName?: string
  date: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Category {
  id?: string
  userId: string
  name: string
  icon: string
  color: string
  budget: number
  spent?: number
  transactions?: Array<string>
  createdAt?: Timestamp
  updatedAt?: Timestamp
  monthlyBudgets?: {
    [key: string]: number
  }
  monthlySpending?: {
    [key: string]: {
      spent: number
      transactions: number
    }
  }
}

export interface UserSettings {
  id?: string
  userId: string
  currency: string
  monthlyIncome?: number
  monthlyBudget?: number
  displayName?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Subscription {
  id?: string
  userId: string
  name: string
  provider: string
  amount: number
  renewalDate: string
  status: "active" | "cancelled"
  daysUntilRenewal?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

interface GroupedTransactions {
  [categoryId: string]: Transaction[]
}

// Transactions
export const getTransactions = async (userId: string, constraints: QueryConstraint[] = []) => {
  try {
    const transactionsRef = collection(db, "transactions")
    const q = query(
      transactionsRef,
      where("userId", "==", userId),
      ...constraints,
      orderBy("date", "desc")
    )
    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction)
    })
    return { data: transactions, error: null }
  } catch (error: any) {

    return { data: [], error: error.message }
  }
}

export const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
  try {
    console.log("Adding transaction", transaction)
    const transactionsRef = collection(db, "transactions")
    const newTransaction = {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

  //   let currentCatData = await  getCategory(transaction.categoryId);
  //   let category = currentCatData.data;

  //  console.log("Current category data", category?.spent);
  //   let newTotalSpent = category?.spent ? category.spent + transaction.amount : transaction.amount;


    const docRef = await addDoc(transactionsRef, newTransaction)
    //  const updaedCategory = {
    //   id: transaction.categoryId,
      
    //    spent: newTotalSpent,
    //   transactions: category?.transactions?.push(docRef.id || ""),
    // }
    return { id: docRef.id, error: null }
  } catch (error: any) {
    console.error("Error adding transaction", error)
    return { id: null, error: error.message }
  }
}

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    const transactionRef = doc(db, "transactions", transactionId)
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteTransaction = async (transactionId: string) => {
  try {
    const transactionRef = doc(db, "transactions", transactionId)
    await deleteDoc(transactionRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Categories

// export const getCategories = async (userId: string) => {
//   try {
//     const categoriesRef = collection(db, "categories")
//     console.log("Getting categories for user", userId)
//     const q = query(categoriesRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
//     const querySnapshot = await getDocs(q)
//     const categories: Category[] = []



//     querySnapshot.forEach((doc) => {
//       categories.push({ id: doc.id, ...doc.data() } as Category)
//     })

//     let transactions = await getTransactions(userId);
//     if(transactions.error){
//       return { data: [], error: transactions.error }
//     }
//     const groupedTransactions: GroupedTransactions = {}

// transactions.data.forEach((transaction) => {
//   const key = transaction.categoryId || ""  // empty string for uncategorized
//   if (!groupedTransactions[key]) {
//     groupedTransactions[key] = []
//   }
//   groupedTransactions[key].push(transaction)
// })

// console.log(groupedTransactions)

// categories.forEach((category) => {
//   const catTransactions = groupedTransactions[category.id || ""] || []
//   let totalSpent = 0
//   if(catTransactions.length > 0){
//    totalSpent = catTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

// console.log(totalSpent) // 175
//   }
  

//   category.spent = totalSpent
  
// })
// console.log("returned info", categories)
//      return { data: categories, error: null }
//   } catch (error: any) {
//     console.error("Error getting categories", error)
//     return { data: [], error: error.message }
//   }
// }

export const getCategories = async (userId: string) => {
  try {
    const categoriesRef = collection(db, "categories")
    const q = query(
      categoriesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)

    const categories: Category[] = []
    querySnapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() } as Category)
    })

    // === Get all transactions ===
    let transactions = await getTransactions(userId)
    if (transactions.error) {
      return { data: [], error: transactions.error }
    }

    // ===== 1. Group by categoryId THEN by year-month =====
    const grouped: {
      [categoryId: string]: {
        [yearMonth: string]: {
          spent: number
          transactions: number
        }
      }
    } = {}

    transactions.data.forEach((tx) => {
      const catId = tx.categoryId || ""
      const yearMonth = tx.date.slice(0, 7) // "2025-11-28" → "2025-11"

      if (!grouped[catId]) grouped[catId] = {}
      if (!grouped[catId][yearMonth]) {
        grouped[catId][yearMonth] = { spent: 0, transactions: 0 }
      }

      grouped[catId][yearMonth].spent += tx.amount
      grouped[catId][yearMonth].transactions += 1
    })

    // ===== 2. Apply grouped data to each category =====
    categories.forEach((category) => {
      const catId = category.id
      category.monthlySpending = grouped[catId] || {}
    })

    return { data: categories, error: null }
  } catch (error: any) {
    console.error("Error getting categories", error)
    return { data: [], error: error.message }
  }
}


export interface CategoryResponse {
  data: Category | null
  error: string | null
}


export const getCategory = async (categoryId: string): Promise<CategoryResponse> => {
  try {
    console.log("Getting category", categoryId)

    const docRef = doc(db, "categories", categoryId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return { data: null, error: "Category not found" }
    }
    
    return {
      data: { id: docSnap.id, ...docSnap.data() } as Category,
      error: null,
    }
  } catch (error: any) {
    console.error("Error getting category", error)
    return { data: null, error: error.message }
  }
}

export const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
  try {
    const categoriesRef = collection(db, "categories")
    const newCategory = {
      ...category,
      spent: category.spent || 0,
      transactions: category.transactions || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await addDoc(categoriesRef, newCategory)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
  try {
    const categoryRef = doc(db, "categories", categoryId)
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, "categories", categoryId)
    await deleteDoc(categoryRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

//get chat data
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function getIncomeVsExpenseLast12Months(transactions: Transaction[]) {
  const results: { name: string; income: number; expense: number }[] = []

  const now = new Date()

  // Loop for current month + previous 4
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    // Filter transactions belonging to this month
    const monthTransactions = transactions.filter(
      (t) => t.date.slice(0, 7) === yearMonth
    )

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    results.unshift({
      name: MONTH_NAMES[date.getMonth()],
      income,
      expense,
    })
  }

  return results
}

export function getExpensesLast30Days(transactions: Transaction[]) {
  const results: { name: number; expense: number }[] = []

  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const yearMonthDay = date.toISOString().slice(0, 10) // "2025-11-28"

    // Filter transactions for this exact day
    const dailyTransactions = transactions.filter(
      (t) => t.type === "expense" && t.date === yearMonthDay
    )

    const totalExpense = dailyTransactions.reduce((sum, t) => sum + t.amount, 0)

    results.push({
      name: date.getDate(), // day of month
      expense: totalExpense,
    })
  }

  return results
}

// User Settings
export const getUserSettings = async (userId: string) => {
  try {
    const settingsRef = doc(db, "userSettings", userId)
    const settingsSnap = await getDoc(settingsRef)
    if (settingsSnap.exists()) {
      return { data: { id: settingsSnap.id, ...settingsSnap.data() } as UserSettings, error: null }
    } else {
      // Create default settings if they don't exist
      const defaultSettings: Omit<UserSettings, "id"> = {
        userId,
        currency: "USD",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      await addDoc(collection(db, "userSettings"), defaultSettings)
      return { data: defaultSettings as UserSettings, error: null }
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateUserSettings = async (userId: string, updates: Partial<UserSettings>) => {
  try {
    const settingsRef = doc(db, "userSettings", userId)
    const settingsSnap = await getDoc(settingsRef)

    if (settingsSnap.exists()) {
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } else {
      // Create settings if they don't exist
      await addDoc(collection(db, "userSettings"), {
        userId,
        ...updates,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Subscriptions
export const getSubscriptions = async (userId: string) => {
  try {
    const subscriptionsRef = collection(db, "subscriptions")
    const q = query(
      subscriptionsRef,
      where("userId", "==", userId),
      orderBy("renewalDate", "asc")
    )
    const querySnapshot = await getDocs(q)
    const subscriptions: Subscription[] = []
    querySnapshot.forEach((doc) => {
      subscriptions.push({ id: doc.id, ...doc.data() } as Subscription)
    })
    return { data: subscriptions, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export const addSubscription = async (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
  try {
    const subscriptionsRef = collection(db, "subscriptions")
    const newSubscription = {
      ...subscription,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await addDoc(subscriptionsRef, newSubscription)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId)
    await updateDoc(subscriptionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteSubscription = async (subscriptionId: string) => {
  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId)
    await deleteDoc(subscriptionRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Helper function to calculate category spent amount
export const calculateCategorySpent = async (userId: string, categoryId: string) => {
  try {
    const transactionsRef = collection(db, "transactions")
    const q = query(
      transactionsRef,
      where("userId", "==", userId),
      where("categoryId", "==", categoryId),
      where("type", "==", "expense")
    )
    const querySnapshot = await getDocs(q)
    let totalSpent = 0
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      totalSpent += data.amount || 0
    })
    return totalSpent
  } catch (error: any) {
    return 0
  }
}


