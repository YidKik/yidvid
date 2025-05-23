
import * as React from "react"
import { toast as sonnerToast } from "sonner"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

// Empty state - no toasts
const memoryState: State = { toasts: [] }

// Create our forwarding functions to sonner with consistent bottom positioning
function toast(props: { title?: string; description?: string; variant?: "default" | "destructive"; id?: string }) {
  const { title, description, variant, id } = props
  const toastOptions = {
    description: title ? description : undefined,
    id,
    position: "bottom-center" as const
  }
  
  if (variant === "destructive") {
    return sonnerToast.error(title || description || "", toastOptions)
  }
  return sonnerToast(title || description || "", toastOptions)
}

// Hook that forwards to sonner but maintains interface compatibility
function useToast() {
  return {
    toasts: [],
    toast: (props: { title?: string; description?: string; variant?: "default" | "destructive"; id?: string }) => {
      toast(props)
    },
    dismiss: (id?: string) => sonnerToast.dismiss(id),
    addToast: (props: { title?: string; description?: string; variant?: "default" | "destructive"; id?: string }) => {
      toast(props)
    },
    removeToast: (id?: string) => sonnerToast.dismiss(id),
  }
}

// Add these extensions to make the toast function work as expected with consistent positioning
toast.success = (message: string, opts?: { id?: string }) => sonnerToast.success(message, { ...opts, position: "bottom-center" })
toast.error = (message: string, opts?: { id?: string }) => sonnerToast.error(message, { ...opts, position: "bottom-center" })
toast.warning = (message: string, opts?: { id?: string }) => sonnerToast.warning(message, { ...opts, position: "bottom-center" })
toast.info = (message: string, opts?: { id?: string }) => sonnerToast.info(message, { ...opts, position: "bottom-center" })
toast.loading = (message: string, opts?: { id?: string }) => sonnerToast.loading(message, { ...opts, position: "bottom-center" })
toast.dismiss = (id?: string) => sonnerToast.dismiss(id)
// Fix the custom method type - using React.createElement instead of JSX
toast.custom = (content: React.ReactNode, opts?: { id?: string }) => 
  sonnerToast.custom(() => React.createElement(React.Fragment, null, content), { ...opts, position: "bottom-center" })

export { useToast, toast }
