
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
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
        // Prevent duplicate toast notifications by using id
        closeButton: true,
        duration: 5000, // 5 seconds duration
      }}
      richColors={false}
      expand={false}
      position="bottom-right"
      visibleToasts={3}
      {...props}
    />
  )
}

export { Toaster }
