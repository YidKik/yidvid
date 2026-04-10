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
        className="mt-auto border-t hidden md:block bg-[#FAFAFA] dark:bg-[#0f0f0f] border-[#EFEFEF] dark:border-[#333]"
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
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#999999'
                }}
              >
                quality Jewish content for everyone
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTosDialogOpen(true)}
                className="text-xs font-medium transition-colors hover:text-[#FF0000]"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#999999'
                }}
              >
                Terms of Service
              </button>
              <span style={{ color: '#E5E5E5' }}>|</span>
              <button 
                onClick={() => setPrivacyDialogOpen(true)}
                className="text-xs font-medium transition-colors hover:text-[#FF0000]"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#999999'
                }}
              >
                Privacy Policy
              </button>
              <span style={{ color: '#E5E5E5' }}>|</span>
              <button 
                onClick={() => setContactDialogOpen(true)}
                className="text-xs font-medium transition-colors hover:text-[#FF0000]"
                style={{ 
                  fontFamily: "'Quicksand', sans-serif",
                  color: '#999999'
                }}
              >
                Contact
              </button>
            </div>

            {/* Copyright */}
            <div 
              className="text-xs"
              style={{ 
                fontFamily: "'Quicksand', sans-serif",
                color: '#BBBBBB'
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
