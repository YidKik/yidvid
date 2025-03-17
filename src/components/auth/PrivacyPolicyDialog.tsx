
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold text-center">Privacy Policy</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="p-6 max-h-[60vh]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Introduction</h3>
            <p>
              At YidVid, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            
            <h3 className="text-lg font-semibold">2. Information We Collect</h3>
            <p>
              We may collect several types of information from and about users of our platform, including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Personal identifiers such as name, email address, and username</li>
              <li>Account credentials</li>
              <li>Usage data and browsing history within our platform</li>
              <li>Device and browser information</li>
              <li>Location data</li>
              <li>Information you provide when contacting us or participating in surveys</li>
            </ul>
            
            <h3 className="text-lg font-semibold">3. How We Collect Information</h3>
            <p>
              We collect information:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Directly from you when you register, use our service, or communicate with us</li>
              <li>Automatically as you navigate through our platform using cookies and similar technologies</li>
              <li>From third-party services with your consent</li>
            </ul>
            
            <h3 className="text-lg font-semibold">4. How We Use Your Information</h3>
            <p>
              We may use the information we collect to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide, maintain, and improve our platform</li>
              <li>Process and manage your account</li>
              <li>Personalize your experience</li>
              <li>Communicate with you, including sending notifications and updates</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues or security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <h3 className="text-lg font-semibold">5. Sharing Your Information</h3>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Service providers who perform services on our behalf</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law or to protect our rights</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
            
            <h3 className="text-lg font-semibold">6. Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
            
            <h3 className="text-lg font-semibold">7. Your Rights and Choices</h3>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate or incomplete information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction or objection to processing</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us through the methods provided at the end of this policy.
            </p>
            
            <h3 className="text-lg font-semibold">8. Children's Privacy</h3>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
            
            <h3 className="text-lg font-semibold">9. Changes to Our Privacy Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            
            <h3 className="text-lg font-semibold">10. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us through the support channels provided on our platform.
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
