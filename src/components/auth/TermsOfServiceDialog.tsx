
import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TermsOfServiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsOfServiceDialog: React.FC<TermsOfServiceDialogProps> = ({
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
                <FileText className="w-5 h-5" style={{ color: '#222' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: '#222' }}>Terms of Service</h2>
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
              <h3 className="text-base font-bold" style={{ color: '#222' }}>1. Acceptance of Terms</h3>
              <p>By accessing or using YidVid, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>2. Description of Service</h3>
              <p>YidVid provides a platform for users to discover and watch curated video content. Our service aggregates content from various sources, primarily YouTube, to provide a family-friendly viewing experience.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>3. User Accounts</h3>
              <p>To access certain features of our platform, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              <p>You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>4. User Conduct</h3>
              <p>When using our service, you agree not to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Share inappropriate or offensive content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use our service for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Distribute viruses or malicious code</li>
              </ul>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>5. Content and Intellectual Property</h3>
              <p>YidVid does not claim ownership of third-party content available through our service. All content remains the property of its original owners and is subject to their respective terms of service and copyright policies.</p>
              <p>The YidVid platform, including its design, logos, and software, is protected by intellectual property rights owned by us. You may not use our trademarks or branding without our prior written consent.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>6. Privacy</h3>
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>7. Limitation of Liability</h3>
              <p>YidVid provides its service on an "as is" and "as available" basis. We do not guarantee that our service will be uninterrupted, timely, secure, or error-free.</p>
              <p>To the fullest extent permitted by law, YidVid shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>8. Modifications to the Service</h3>
              <p>We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice. We may also update these Terms of Service from time to time. Continued use of our service after such changes constitutes your acceptance of the revised terms.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>9. Termination</h3>
              <p>We reserve the right to terminate or suspend your account and access to our service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>10. Governing Law</h3>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles.</p>

              <h3 className="text-base font-bold" style={{ color: '#222' }}>11. Contact Us</h3>
              <p>If you have any questions about these Terms of Service, please contact us through the support channels provided on our platform.</p>
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
