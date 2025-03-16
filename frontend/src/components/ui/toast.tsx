import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as React from "react"
// Importamos los elementos necesarios de react-hot-toast
import * as ReactHotToast from "react-hot-toast";
const { Toaster } = ReactHotToast;
const toastFunc = ReactHotToast.default || ReactHotToast.toast;

import { cn } from "@/lib/utils"

// We're creating a simpler toast system using react-hot-toast instead of Radix UI

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  )
}

const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
      className
    )}
    {...props}
  />
)
ToastViewport.displayName = "ToastViewport"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {}

const Toast: React.FC<ToastProps> = ({ className, variant, ...props }) => {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}
Toast.displayName = "Toast"

type ToastActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const ToastAction: React.FC<ToastActionProps> = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
)
ToastAction.displayName = "ToastAction"

type ToastCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const ToastClose: React.FC<ToastCloseProps> = ({ className, ...props }) => (
  <button
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    aria-label="Close"
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
)
ToastClose.displayName = "ToastClose"

type ToastTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const ToastTitle: React.FC<ToastTitleProps> = ({ className, ...props }) => (
  <h3
    className={cn("text-sm font-semibold", className)}
    {...props}
  >
    {props.children}
  </h3>
)
ToastTitle.displayName = "ToastTitle"

type ToastDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const ToastDescription: React.FC<ToastDescriptionProps> = ({ className, ...props }) => (
  <p
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
)
ToastDescription.displayName = "ToastDescription"

// Custom function to show toast using react-hot-toast
const showToast = {
  default: (message: string) => toastFunc(message),
  success: (message: string) => ReactHotToast.toast.success(message),
  error: (message: string) => ReactHotToast.toast.error(message),
  loading: (message: string) => ReactHotToast.toast.loading(message),
  dismiss: () => ReactHotToast.toast.dismiss()
}

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  showToast
}