
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
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
        },
        duration: 4000, // 4 seconds duration
      }}
      richColors={false}
      expand={false}
      position="bottom-center" // Always use bottom-center for consistency
      visibleToasts={3}
      closeButton={false}
      toastDeduplication={true} // Enable toast deduplication
      {...props}
    />
  )
}

export { Toaster }
