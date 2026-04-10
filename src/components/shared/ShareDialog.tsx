import { useState } from "react";
import { Copy, Mail, MessageCircle, Link2, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

const shareOptions = [
  {
    id: "copy",
    label: "Copy link",
    icon: Link2,
    color: "#1A1A1A",
    darkColor: "#e8e8e8",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "#25D366",
    darkColor: "#25D366",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    color: "#FF0000",
    darkColor: "#FF0000",
  },
];

export const ShareDialog = ({ open, onOpenChange, url, title }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (optionId: string) => {
    switch (optionId) {
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
          "_blank"
        );
        break;
      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white dark:bg-[#212121] border-[#E5E5E5] dark:border-[#333] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-[#1A1A1A] dark:!text-[#e8e8e8]">
            Share
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-1">
          {shareOptions.map((option) => {
            const Icon = option.id === "copy" && copied ? Check : option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${option.color}15` }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: option.color }}
                  />
                </div>
                <span className="text-sm font-medium text-[#1A1A1A] dark:!text-[#e8e8e8]">
                  {option.id === "copy" && copied ? "Copied!" : option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* URL preview */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 bg-[#F5F5F5] dark:bg-[#1a1a1a] rounded-lg px-3 py-2">
            <Link2 className="w-3.5 h-3.5 text-[#999] flex-shrink-0" />
            <span className="text-xs text-[#666] dark:!text-[#888] truncate">{url}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
