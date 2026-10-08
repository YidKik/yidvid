import { useState } from "react";
import { TermsOfServiceDialog } from "@/components/auth/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "@/components/auth/PrivacyPolicyDialog";
import { ContactDialog } from "@/components/contact/ContactDialog";

export type NavDialogKind = "contact" | "terms" | "privacy" | null;

/** Existing Contact/Terms/Privacy popups, opened from navigation menus. */
export function useNavDialogs() {
  const [open, setOpen] = useState<NavDialogKind>(null);
  const close = (v: boolean) => { if (!v) setOpen(null); };
  const element = (
    <>
      <ContactDialog open={open === "contact"} onOpenChange={close} />
      <TermsOfServiceDialog isOpen={open === "terms"} onOpenChange={close} />
      <PrivacyPolicyDialog isOpen={open === "privacy"} onOpenChange={close} />
    </>
  );
  return { openDialog: setOpen, element };
}
