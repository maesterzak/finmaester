# React Toastify Setup

## Overview

The application now uses **react-toastify** for all notifications. This provides a modern, customizable toast notification system.

## Installation

If you haven't already installed react-toastify:

```bash
npm install react-toastify --legacy-peer-deps
```

## Usage

### Basic Usage

Import the toast functions from `@/lib/toast`:

```typescript
import { toastSuccess, toastError, toastInfo, toastWarning, toastDefault } from "@/lib/toast"
```

### Available Functions

1. **toastSuccess(message, options?)**
   - Shows a success notification (green)
   ```typescript
   toastSuccess("Operation completed successfully!")
   ```

2. **toastError(message, options?)**
   - Shows an error notification (red)
   ```typescript
   toastError("Something went wrong!")
   ```

3. **toastInfo(message, options?)**
   - Shows an info notification (blue)
   ```typescript
   toastInfo("Here's some information")
   ```

4. **toastWarning(message, options?)**
   - Shows a warning notification (yellow)
   ```typescript
   toastWarning("Please be careful")
   ```

5. **toastDefault(message, options?)**
   - Shows a default notification
   ```typescript
   toastDefault("Default message")
   ```

6. **toastPromise(promise, messages, options?)**
   - Shows a promise-based toast (pending → success/error)
   ```typescript
   toastPromise(
     fetchData(),
     {
       pending: "Loading data...",
       success: "Data loaded successfully!",
       error: "Failed to load data"
     }
   )
   ```

### Custom Options

You can customize each toast with options:

```typescript
toastSuccess("Success!", {
  autoClose: 5000,        // Auto close after 5 seconds
  position: "top-center", // Position
  hideProgressBar: true, // Hide progress bar
  closeOnClick: false,   // Don't close on click
})
```

### Available Options

- `position`: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left"
- `autoClose`: number (milliseconds) or false
- `hideProgressBar`: boolean
- `closeOnClick`: boolean
- `pauseOnHover`: boolean
- `draggable`: boolean
- `theme`: "light" | "dark" | "colored"

## Default Configuration

The default configuration is set in `lib/toast.ts`:

```typescript
{
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
}
```

## Components Updated

All components have been updated to use react-toastify:

- ✅ `components/auth/login-form.tsx`
- ✅ `components/auth/signup-form.tsx`
- ✅ `components/auth/forgot-password-form.tsx`
- ✅ `hooks/useTransactions.ts`
- ✅ `hooks/useCategories.ts`

## Toast Container

The `ToastContainer` component is automatically included in the root layout (`app/layout.tsx`). It handles displaying all toast notifications.

## Styling

Custom styles for react-toastify are included in `app/globals.css` to match your application's theme. The toasts automatically adapt to light/dark mode.

## Examples

### Authentication
```typescript
// Success
toastSuccess("Welcome back to FinMaester!")

// Error
toastError("Invalid email or password")
```

### Transactions
```typescript
// Success
toastSuccess("Transaction added successfully")

// Error
toastError("Failed to add transaction")
```

### Promise-based
```typescript
toastPromise(
  saveTransaction(data),
  {
    pending: "Saving transaction...",
    success: "Transaction saved!",
    error: "Failed to save transaction"
  }
)
```

## Migration from Old Toast System

If you have any remaining components using the old toast system (`useToast` from `@/components/ui/use-toast`), replace them with react-toastify:

**Before:**
```typescript
const { toast } = useToast()
toast({
  title: "Success",
  description: "Operation completed",
  variant: "default"
})
```

**After:**
```typescript
import { toastSuccess } from "@/lib/toast"
toastSuccess("Operation completed")
```

## Documentation

For more information, visit:
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/introduction/)


