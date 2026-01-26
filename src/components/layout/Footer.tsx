import { useState } from "react";
import { Link } from "react-router-dom";
import yidvidLogo from "@/assets/yidvid-logo-icon.png";
import { TermsOfServiceDialog } from "@/components/auth/TermsOfServiceDialog";
import { PrivacyPolicyDialog } from "@/components/auth/PrivacyPolicyDialog";
import { ContactDialog } from "@/components/contact/ContactDialog";

export const Footer = () => {
  const [tosDialogOpen, setTosDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <>
      <footer 
        className="mt-auto border-t"
        style={{ 
          backgroundColor: 'hsl(50, 100%, 96%)',
          borderColor: 'hsl(50, 80%, 85%)'
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Tagline */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={yidvidLogo} 
                alt="YidVid" 
                className="w-8 h-8 object-contain"
                style={{ opacity: 1 }}
              />
              <span 
                className="text-sm font-medium"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: 'hsl(0, 0%, 30%)'
                }}
              >
                quality Jewish content for everyone
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setTosDialogOpen(true)}
                className="text-sm font-medium transition-colors hover:text-red-500"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: 'hsl(0, 0%, 45%)'
                }}
              >
                Terms of Service
              </button>
              <span style={{ color: 'hsl(0, 0%, 75%)' }}>|</span>
              <button 
                onClick={() => setPrivacyDialogOpen(true)}
                className="text-sm font-medium transition-colors hover:text-red-500"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: 'hsl(0, 0%, 45%)'
                }}
              >
                Privacy Policy
              </button>
              <span style={{ color: 'hsl(0, 0%, 75%)' }}>|</span>
              <button 
                onClick={() => setContactDialogOpen(true)}
                className="text-sm font-medium transition-colors hover:text-red-500"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: 'hsl(0, 0%, 45%)'
                }}
              >
                Contact
              </button>
            </div>

            {/* Copyright */}
            <div 
              className="text-sm"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                color: 'hsl(0, 0%, 55%)'
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
