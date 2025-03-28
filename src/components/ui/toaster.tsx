import { useToast } from "@/hooks/use-toast"
import {
  Toast,
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
            className={`${isMobile ? 'max-w-[90%] p-2 pr-2 scale-90 origin-bottom-center rounded-lg shadow-md bg-white text-black toast-mobile-enter' : 'md:max-w-[420px] bg-white text-black'}`}
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
          </Toast>
        )
      })}
      <ToastViewport className={`gap-1 ${isMobile ? 'p-1 flex flex-col items-center' : 'gap-2'}`} />
    </ToastProvider>
  )
}
