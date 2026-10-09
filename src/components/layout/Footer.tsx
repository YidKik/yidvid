import { useState } from "react";
import { Link } from "react-router-dom";
import yidvidLogo from "@/assets/yidvid-logo-icon.png";
import { TermsOfServiceDialog } from "@/components/auth/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "@/components/auth/PrivacyPolicyDialog";
import { ContactDialog } from "@/components/contact/ContactDialog";
import { useSidebarContext } from "@/contexts/SidebarContext";

export const Footer = () => {
  const [tosDialogOpen, setTosDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { sidebarWidth } = useSidebarContext();

  return (
    <>
      <footer 
        className="mt-auto border-t hidden md:block bg-muted dark:bg-background border-border dark:border-border transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-2.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Logo and Tagline */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={yidvidLogo} 
                alt="YidVid" 
                className="w-10 h-10 object-contain"
              />
              <span 
                className="text-xs font-medium"
                style={{ 
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                quality Jewish content for everyone
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTosDialogOpen(true)}
                className="type-footer font-medium min-h-11 px-1 inline-flex items-center rounded-control transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ 
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                Terms of Service
              </button>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>|</span>
              <button 
                onClick={() => setPrivacyDialogOpen(true)}
                className="type-footer font-medium min-h-11 px-1 inline-flex items-center rounded-control transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ 
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                Privacy Policy
              </button>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>|</span>
              <button 
                onClick={() => setContactDialogOpen(true)}
                className="type-footer font-medium min-h-11 px-1 inline-flex items-center rounded-control transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ 
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                Contact
              </button>
            </div>

            {/* Copyright */}
            <div 
              className="text-xs"
              style={{ 
                color: 'hsl(var(--muted-foreground))'
              }}
            >
              © {new Date().getFullYear()} YidVid
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <TermsOfServiceDialog isOpen={tosDialogOpen} onOpenChange={setTosDialogOpen} />
      <PrivacyPolicyDialog isOpen={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </>
  );
};
