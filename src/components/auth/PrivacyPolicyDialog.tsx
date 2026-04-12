
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
          className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[calc(100%-2rem)] max-h-[75vh]' : 'w-[640px] max-h-[80vh]'} rounded-2xl overflow-hidden shadow-xl p-0 bg-white dark:bg-[#1a1a1a]`}
          style={{
            border: '2px solid #FFCC00',
            animation: isOpen ? 'legalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-[#333]"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] dark:border-[#333]">
            <div className="flex items-center gap-3 pr-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFCC00' }}>
                <Shield className="w-5 h-5" style={{ color: '#222' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#222] dark:!text-[#e8e8e8]">Privacy Policy</h2>
                <p className="text-xs text-[#999] dark:!text-[#888]">
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
            <div className="space-y-4 text-sm leading-relaxed text-[#333] dark:!text-[#ccc]">
              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">1. Introduction</h3>
              <p>At YidVid ("the Platform," "we," "us," or "our"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this policy carefully. By using YidVid, you consent to the data practices described in this Privacy Policy.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">2. Information We Collect</h3>
              <p>We may collect several types of information from and about users of our Platform, including:</p>
              <p><strong>Personal Information:</strong></p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Name, email address, and username provided during registration</li>
                <li>Account credentials and authentication data</li>
                <li>Profile information such as display name and avatar</li>
                <li>Communication data when you contact us through our support channels</li>
              </ul>
              <p><strong>Usage and Technical Data:</strong></p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Browsing history and viewing activity within our Platform</li>
                <li>Search queries and content interactions (likes, saves, watch history)</li>
                <li>Device information (device type, operating system, browser type and version)</li>
                <li>IP address and approximate geographic location</li>
                <li>Referring URLs and pages visited</li>
                <li>Date and time of visits, session duration, and page views</li>
              </ul>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">3. How We Collect Information</h3>
              <p>We collect information through the following methods:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li><strong>Directly from you</strong> – when you register, create a profile, use features, submit forms, or communicate with us</li>
                <li><strong>Automatically</strong> – as you navigate and interact with the Platform, using cookies, local storage, and similar tracking technologies</li>
                <li><strong>From third-party services</strong> – including authentication providers (e.g., Google OAuth) and analytics services, with your consent</li>
              </ul>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">4. Cookies and Tracking Technologies</h3>
              <p>We use cookies, local storage, and similar technologies to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns to improve our Platform</li>
                <li>Provide personalized content recommendations</li>
              </ul>
              <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of the Platform.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">5. How We Use Your Information</h3>
              <p>We may use the information we collect to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Provide, operate, maintain, and improve the Platform</li>
                <li>Process and manage your account registration and authentication</li>
                <li>Personalize your experience and deliver tailored content</li>
                <li>Communicate with you, including sending service-related notifications, updates, and promotional materials (with your consent)</li>
                <li>Analyze usage patterns, trends, and Platform performance</li>
                <li>Detect, prevent, and address fraud, security incidents, and technical issues</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
                <li>Respond to your inquiries, comments, and support requests</li>
              </ul>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">6. Third-Party Services and Data Sharing</h3>
              <p>YidVid integrates with third-party services that may collect and process your data independently. These include:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li><strong>YouTube / Google</strong> – Video content is streamed via YouTube. Your use of video content is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF0000' }}>Google's Privacy Policy</a> and <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF0000' }}>YouTube's Terms of Service</a></li>
                <li><strong>Supabase</strong> – Used for authentication, database, and backend services</li>
                <li><strong>Analytics services</strong> – Used to understand how users interact with our Platform</li>
              </ul>
              <p>We may also share your information with:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Service providers who perform services on our behalf (e.g., email delivery, hosting)</li>
                <li>Legal authorities when required by law, court order, or governmental regulation</li>
                <li>Third parties in connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p><strong>We do not sell your personal information to third parties.</strong></p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">7. Data Retention</h3>
              <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. We may also retain and use your information to comply with legal obligations, resolve disputes, and enforce our agreements. When your data is no longer needed, we will securely delete or anonymize it.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">8. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction, including:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure authentication mechanisms including hashed passwords</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and role-based permissions</li>
              </ul>
              <p>However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">9. Your Rights and Choices</h3>
              <p>Depending on your location and applicable law, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li><strong>Right of Access</strong> – Request a copy of the personal data we hold about you</li>
                <li><strong>Right to Rectification</strong> – Request correction of inaccurate or incomplete information</li>
                <li><strong>Right to Erasure</strong> – Request deletion of your personal information ("right to be forgotten")</li>
                <li><strong>Right to Restriction</strong> – Request restriction of processing of your personal data</li>
                <li><strong>Right to Data Portability</strong> – Request transfer of your data in a machine-readable format</li>
                <li><strong>Right to Object</strong> – Object to processing of your personal data for certain purposes</li>
                <li><strong>Right to Withdraw Consent</strong> – Withdraw consent where processing is based on consent</li>
              </ul>
              <p>To exercise these rights, please contact us through our support channels. We will respond to your request within a reasonable timeframe and in accordance with applicable law. You may also delete your account at any time through your account settings.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">10. Children's Privacy</h3>
              <p>Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover that we have collected personal information from a child under 13 without verified parental consent, we will take steps to delete that information promptly.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">11. International Data Transfers</h3>
              <p>Your information may be transferred to and maintained on servers located outside your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using the Platform, you consent to such transfers. We will take reasonable steps to ensure that your data is treated securely and in accordance with this Privacy Policy.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">12. California Privacy Rights (CCPA)</h3>
              <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to request deletion, and the right to opt-out of the sale of personal information. As stated above, we do not sell personal information. To exercise your CCPA rights, please contact us through our support channels.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">13. European Privacy Rights (GDPR)</h3>
              <p>If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR). Our legal basis for processing your personal data includes: performance of a contract, legitimate interests, consent, and compliance with legal obligations. You have the right to lodge a complaint with your local data protection authority.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">14. Email Communications</h3>
              <p>We may send you service-related emails (e.g., account verification, security alerts) that are necessary for the operation of your account. You may also opt in to receive promotional or notification emails. You can manage your email preferences in your account settings or unsubscribe using the link provided in each email.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">15. Changes to Our Privacy Policy</h3>
              <p>We may update our Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically. Your continued use of the Platform after any changes constitutes your acceptance of the updated Privacy Policy.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">16. Contact Us</h3>
              <p>If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us through the support channels provided on our Platform. We will make every effort to resolve your concerns in a timely manner.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">17. Administrative Data Access</h3>
              <p>To ensure platform quality, safety, and compliance, authorized administrators may access and review user activity data including watch history, session information, engagement metrics, content interactions, subscription activity, and support request history. This access is used exclusively for platform management, content moderation, user support, and service improvement. All administrative access is governed by strict internal policies and role-based access controls to protect your privacy.</p>
            </div>
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
