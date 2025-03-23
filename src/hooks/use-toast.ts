
import * as React from "react"

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

// No-op toast function that accepts arguments but does nothing with them
function toast() {
  return {
    id: "",
    dismiss: () => {},
    update: () => {},
  }
}

// Empty hook that provides toast functionality without actually showing toasts
// But allows any number of arguments to be passed (and ignored)
function useToast() {
  return {
    toasts: [],
    toast: () => {},
    dismiss: () => {},
    addToast: () => {},
    removeToast: () => {},
  }
}

// Add these extensions to make the toast function work as expected
toast.success = () => {}
toast.error = () => {}
toast.warning = () => {}
toast.info = () => {}
toast.loading = () => {}
toast.dismiss = () => {}
toast.custom = () => {}

export { useToast, toast }
