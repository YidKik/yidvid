
import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PrivacyPolicyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { isMobile } = useIsMobile();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          style={{ animation: isOpen ? 'legalFadeIn 0.3s ease-out' : undefined }}
        />
        <DialogPrimitive.Content
          className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[calc(100%-2rem)] max-h-[85vh]' : 'w-[640px] max-h-[80vh]'} rounded-2xl overflow-hidden shadow-xl p-0 bg-white`}
          style={{
            border: '2px solid #FFCC00',
            animation: isOpen ? 'legalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ color: '#666' }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #E5E5E5' }}>
            <div className="flex items-center gap-3 pr-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFCC00' }}>
                <Shield className="w-5 h-5" style={{ color: '#222' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: '#222' }}>Privacy Policy</h2>
                <p className="text-xs" style={{ color: '#999' }}>
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className={`px-6 py-5 overflow-y-auto ${isMobile ? 'max-h-[calc(85vh-140px)]' : 'max-h-[calc(80vh-140px)]'}`}
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#333' }}>
              <h3 className="text-base font-bold" style={{ color: '#222' }}>1. Introduction</h3>
              <p>At YidVid, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>2. Information We Collect</h3>
              <p>We may collect several types of information from and about users of our platform, including:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Personal identifiers such as name, email address, and username</li>
                <li>Account credentials</li>
                <li>Usage data and browsing history within our platform</li>
                <li>Device and browser information</li>
                <li>Location data</li>
                <li>Information you provide when contacting us or participating in surveys</li>
              </ul>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>3. How We Collect Information</h3>
              <p>We collect information:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Directly from you when you register, use our service, or communicate with us</li>
                <li>Automatically as you navigate through our platform using cookies and similar technologies</li>
                <li>From third-party services with your consent</li>
              </ul>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>4. How We Use Your Information</h3>
              <p>We may use the information we collect to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Provide, maintain, and improve our platform</li>
                <li>Process and manage your account</li>
                <li>Personalize your experience</li>
                <li>Communicate with you, including sending notifications and updates</li>
                <li>Analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues or security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>5. Sharing Your Information</h3>
              <p>We may share your information with:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Service providers who perform services on our behalf</li>
                <li>Business partners with your consent</li>
                <li>Legal authorities when required by law or to protect our rights</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>6. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>7. Your Rights and Choices</h3>
              <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction or objection to processing</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p>To exercise these rights, please contact us through the methods provided at the end of this policy.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>8. Children's Privacy</h3>
              <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>9. Changes to Our Privacy Policy</h3>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>10. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us through the support channels provided on our platform.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid #E5E5E5' }}>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full h-10 text-sm font-bold rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF0000', color: 'white' }}
            >
              I Understand
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <style>{`
        @keyframes legalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes legalScaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </DialogPrimitive.Root>
  );
};
