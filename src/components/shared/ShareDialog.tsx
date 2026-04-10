import { useState } from "react";
import { Check, Mail, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
    bg: "bg-[#F5F5F5] dark:bg-[#2a2a2a]",
    hoverBg: "hover:bg-[#E8E8E8] dark:hover:bg-[#383838]",
    iconColor: "text-[#1A1A1A] dark:text-[#e8e8e8]",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    bg: "bg-[#DCFCE7]",
    hoverBg: "hover:bg-[#BBF7D0]",
    iconColor: "text-[#16A34A]",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    bg: "bg-[#FEE2E2]",
    hoverBg: "hover:bg-[#FECACA]",
    iconColor: "text-[#FF0000]",
  },
];

export const ShareDialog = ({ open, onOpenChange, url, title }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (optionId: string) => {
    switch (optionId) {
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied!");
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
      <DialogContent className="sm:max-w-[280px] bg-white dark:bg-[#1a1a1a] border border-[#E5E5E5] dark:border-[#333] rounded-3xl p-5 gap-0 shadow-xl [&>button]:hidden">
        <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#e8e8e8] text-center mb-4">
          Share
        </p>

        <div className="flex items-center justify-center gap-4">
          {shareOptions.map((option) => {
            const isCopy = option.id === "copy";
            const Icon = isCopy && copied ? Check : option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`flex flex-col items-center gap-1.5 group`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${option.bg} ${option.hoverBg} group-hover:scale-110 group-active:scale-95`}
                >
                  <Icon className={`w-5 h-5 ${option.iconColor}`} />
                </div>
                <span className="text-[10px] font-medium text-[#666] dark:text-[#aaa] group-hover:text-[#1A1A1A] dark:group-hover:text-[#e8e8e8] transition-colors">
                  {isCopy && copied ? "Copied!" : option.label}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
