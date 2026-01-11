
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps as SonnerToasterProps } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

// Extend the ToasterProps type to include toastDeduplication
type ToasterProps = React.ComponentProps<typeof Sonner> & {
  toastDeduplication?: boolean;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { isMobile } = useIsMobile()

  return (
    <Sonner
      theme={theme as SonnerToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-900 group-[.toaster]:text-gray-900 dark:group-[.toaster]:text-white group-[.toaster]:border-2 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:border-yellow-800 group-[.toaster]:shadow-xl group-[.toaster]:shadow-yellow-100/50 dark:group-[.toaster]:shadow-none group-[.toaster]:rounded-2xl",
          title: "group-[.toast]:text-gray-900 dark:group-[.toast]:text-white group-[.toast]:font-semibold",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300",
          success: "group-[.toaster]:border-green-300 dark:group-[.toaster]:border-green-700 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-green-50 group-[.toaster]:to-white dark:group-[.toaster]:from-green-900/20 dark:group-[.toaster]:to-gray-900",
          error: "group-[.toaster]:border-red-300 dark:group-[.toaster]:border-red-700 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-50 group-[.toaster]:to-white dark:group-[.toaster]:from-red-900/20 dark:group-[.toaster]:to-gray-900",
          warning: "group-[.toaster]:border-yellow-400 dark:group-[.toaster]:border-yellow-600 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-yellow-50 group-[.toaster]:to-white dark:group-[.toaster]:from-yellow-900/20 dark:group-[.toaster]:to-gray-900",
          info: "group-[.toaster]:border-blue-300 dark:group-[.toaster]:border-blue-700 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-blue-50 group-[.toaster]:to-white dark:group-[.toaster]:from-blue-900/20 dark:group-[.toaster]:to-gray-900",
          actionButton:
            "group-[.toast]:bg-yellow-500 group-[.toast]:hover:bg-yellow-600 group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-gray-100 dark:group-[.toast]:bg-gray-800 group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300 group-[.toast]:rounded-lg",
        },
        duration: 4000,
      }}
      richColors={false}
      expand={false}
      position="bottom-right"
      visibleToasts={4}
      closeButton={false}
      gap={12}
      toastDeduplication={true}
      {...props}
    />
  )
}

export { Toaster }
