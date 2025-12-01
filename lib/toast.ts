import { toast, ToastOptions } from "react-toastify"

// Custom toast configuration
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
}

// Success toast
export const toastSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, { ...defaultOptions, ...options })
}

// Error toast
export const toastError = (message: string, options?: ToastOptions) => {
  return toast.error(message, { ...defaultOptions, ...options })
}

// Info toast
export const toastInfo = (message: string, options?: ToastOptions) => {
  return toast.info(message, { ...defaultOptions, ...options })
}

// Warning toast
export const toastWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, { ...defaultOptions, ...options })
}

// Default toast
export const toastDefault = (message: string, options?: ToastOptions) => {
  return toast(message, { ...defaultOptions, ...options })
}

// Promise toast (for async operations)
export const toastPromise = <T,>(
  promise: Promise<T>,
  {
    pending,
    success,
    error,
  }: {
    pending?: string
    success?: string | ((data: T) => string)
    error?: string | ((error: any) => string)
  },
  options?: ToastOptions
) => {
  return toast.promise(
    promise,
    {
      pending: pending || "Loading...",
      success: success || "Success!",
      error: error || "An error occurred",
    },
    { ...defaultOptions, ...options }
  )
}

// Export default toast function
export { toast }


