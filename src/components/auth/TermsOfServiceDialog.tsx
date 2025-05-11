
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsOfServiceDialog: React.FC<TermsOfServiceDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[80vh] p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold text-center text-black">Terms of Service</DialogTitle>
          <DialogDescription className="text-center text-black/70">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="p-6 max-h-[60vh]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">1. Acceptance of Terms</h3>
            <p className="text-black">
              By accessing or using YidVid, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
            
            <h3 className="text-lg font-semibold text-black">2. Description of Service</h3>
            <p className="text-black">
              YidVid provides a platform for users to discover and watch curated video content. Our service aggregates content from various sources, primarily YouTube, to provide a family-friendly viewing experience.
            </p>
            
            <h3 className="text-lg font-semibold text-black">3. User Accounts</h3>
            <p className="text-black">
              To access certain features of our platform, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p className="text-black">
              You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.
            </p>
            
            <h3 className="text-lg font-semibold text-black">4. User Conduct</h3>
            <p className="text-black">
              When using our service, you agree not to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li className="text-black">Violate any applicable laws or regulations</li>
              <li className="text-black">Infringe upon the rights of others</li>
              <li className="text-black">Share inappropriate or offensive content</li>
              <li className="text-black">Attempt to gain unauthorized access to our systems</li>
              <li className="text-black">Use our service for any illegal or unauthorized purpose</li>
              <li className="text-black">Harass, abuse, or harm another person</li>
              <li className="text-black">Distribute viruses or malicious code</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-black">5. Content and Intellectual Property</h3>
            <p className="text-black">
              YidVid does not claim ownership of third-party content available through our service. All content remains the property of its original owners and is subject to their respective terms of service and copyright policies.
            </p>
            <p className="text-black">
              The YidVid platform, including its design, logos, and software, is protected by intellectual property rights owned by us. You may not use our trademarks or branding without our prior written consent.
            </p>
            
            <h3 className="text-lg font-semibold text-black">6. Privacy</h3>
            <p className="text-black">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
            
            <h3 className="text-lg font-semibold text-black">7. Limitation of Liability</h3>
            <p className="text-black">
              YidVid provides its service on an "as is" and "as available" basis. We do not guarantee that our service will be uninterrupted, timely, secure, or error-free.
            </p>
            <p className="text-black">
              To the fullest extent permitted by law, YidVid shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
            </p>
            
            <h3 className="text-lg font-semibold text-black">8. Modifications to the Service</h3>
            <p className="text-black">
              We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice. We may also update these Terms of Service from time to time. Continued use of our service after such changes constitutes your acceptance of the revised terms.
            </p>
            
            <h3 className="text-lg font-semibold text-black">9. Termination</h3>
            <p className="text-black">
              We reserve the right to terminate or suspend your account and access to our service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
            </p>
            
            <h3 className="text-lg font-semibold text-black">10. Governing Law</h3>
            <p className="text-black">
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles.
            </p>
            
            <h3 className="text-lg font-semibold text-black">11. Contact Us</h3>
            <p className="text-black">
              If you have any questions about these Terms of Service, please contact us through the support channels provided on our platform.
            </p>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex justify-end">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#ea384c] hover:bg-red-700 text-white transition-colors"
          >
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
