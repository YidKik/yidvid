
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useIsMobile } from "@/hooks/use-mobile"

export function Toaster() {
  const { toasts } = useToast()
  const isMobile = useIsMobile()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            className={`${isMobile ? 'max-w-[90%] p-2 pr-5 scale-90 origin-top-right rounded-lg shadow-md bg-white text-black' : 'md:max-w-[420px] bg-white text-black'}`}
          >
            <div className={`grid gap-${isMobile ? '0.5' : '1'}`}>
              {title && <ToastTitle className={isMobile ? "text-xs text-black" : "text-sm text-black"}>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={isMobile ? "text-[10px] leading-tight text-gray-600" : "text-xs text-gray-600"}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-black`} />
          </Toast>
        )
      })}
      <ToastViewport className={`gap-1 ${isMobile ? 'p-1' : 'gap-2'}`} />
    </ToastProvider>
  )
}
