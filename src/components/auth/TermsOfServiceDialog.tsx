
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
          className={`fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] ${isMobile ? 'w-[calc(100%-2rem)] max-h-[85vh]' : 'w-[640px] max-h-[80vh]'} rounded-2xl overflow-hidden shadow-xl p-0 bg-white dark:bg-[#1a1a1a]`}
          style={{
            border: '2px solid #FFCC00',
            animation: isOpen ? 'legalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-[#333]"
            style={{ color: undefined }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] dark:border-[#333]">
            <div className="flex items-center gap-3 pr-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFCC00' }}>
                <FileText className="w-5 h-5" style={{ color: '#222' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#222] dark:!text-[#e8e8e8]">Terms of Service</h2>
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
              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">1. Acceptance of Terms</h3>
              <p>By accessing, browsing, or using YidVid ("the Platform," "we," "us," or "our"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately discontinue use of the Platform. Your continued use of the Platform constitutes your ongoing acceptance of these Terms as they may be amended from time to time.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">2. Description of Service</h3>
              <p>YidVid is a content curation and aggregation platform that provides users with access to curated video content sourced primarily from YouTube and other third-party video hosting services. YidVid does not host, upload, or create video content itself. All video content is streamed directly from third-party services, and YidVid acts solely as an intermediary that organizes and presents this content for a family-friendly viewing experience.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">3. Third-Party Services and Terms</h3>
              <p>YidVid relies on third-party services, including but not limited to YouTube, Google, and Supabase, to deliver its functionality. By using YidVid, you also agree to be bound by the terms and policies of these third-party services, including:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li><strong>YouTube Terms of Service</strong> – <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF0000' }}>https://www.youtube.com/t/terms</a></li>
                <li><strong>Google Privacy Policy</strong> – <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF0000' }}>https://policies.google.com/privacy</a></li>
                <li><strong>YouTube API Services Terms of Service</strong> – <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#FF0000' }}>https://developers.google.com/youtube/terms/api-services-terms-of-service</a></li>
              </ul>
              <p>YidVid is not responsible for the content, policies, or practices of any third-party services. You acknowledge that your use of content accessed through YidVid is subject to the terms and conditions of the original content provider.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">4. Eligibility</h3>
              <p>You must be at least 13 years of age to create an account or use the Platform. If you are under 18, you represent that you have your parent's or legal guardian's permission to use the Platform. By using YidVid, you represent and warrant that you meet these eligibility requirements.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">5. User Accounts</h3>
              <p>To access certain features of our Platform, you may need to create an account. When creating an account, you agree to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that contain inaccurate information or that we reasonably believe are being used in violation of these Terms.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">6. User Conduct</h3>
              <p>When using our Platform, you agree not to:</p>
              <ul className="list-disc ml-6 space-y-1.5">
                <li>Violate any applicable local, state, national, or international laws or regulations</li>
                <li>Infringe upon the intellectual property rights or privacy rights of others</li>
                <li>Share, post, or transmit inappropriate, offensive, defamatory, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems, servers, or networks</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, threaten, or harm another person or entity</li>
                <li>Distribute viruses, malware, or other malicious code</li>
                <li>Interfere with or disrupt the Platform or servers or networks connected to the Platform</li>
                <li>Use automated scripts, bots, or scrapers to access, collect, or interact with the Platform</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the Platform</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
              </ul>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">7. Content and Intellectual Property</h3>
              <p>YidVid does not claim ownership of any third-party content accessible through the Platform. All video content, thumbnails, titles, descriptions, and related metadata remain the property of their respective owners and are subject to their copyright and licensing terms.</p>
              <p>The YidVid platform, including its name, logo, design, layout, software, and all original content created by YidVid, is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from our Platform without our prior written consent, except as permitted by law.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">8. DMCA and Copyright Complaints</h3>
              <p>YidVid respects the intellectual property rights of others. If you believe that content accessible through YidVid infringes your copyright, please contact us through our support channels with a detailed description of the alleged infringement. Since YidVid does not host video content directly, copyright complaints regarding video content should be directed to the original hosting platform (e.g., YouTube).</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">9. Privacy</h3>
              <p>Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to our collection and use of your information as described in the Privacy Policy.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">10. Disclaimers and Limitation of Liability</h3>
              <p><strong>THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong> YidVid disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.</p>
              <p>YidVid does not warrant that: (a) the Platform will be uninterrupted, timely, secure, or error-free; (b) the content will be accurate, reliable, or complete; (c) any defects will be corrected; or (d) the Platform is free of viruses or other harmful components.</p>
              <p><strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YIDVID SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OR INABILITY TO USE THE PLATFORM.</strong></p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">11. Indemnification</h3>
              <p>You agree to indemnify, defend, and hold harmless YidVid and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any rights of another party; or (d) your violation of any applicable law or regulation.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">12. Modifications to the Service and Terms</h3>
              <p>We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without prior notice or liability. We may also update these Terms from time to time. When we make material changes, we will update the "Last updated" date at the top of this page. Your continued use of the Platform after such changes constitutes your acceptance of the revised Terms.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">13. Termination</h3>
              <p>We reserve the right to terminate or suspend your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, us, or third parties, or for any other reason. Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnification, and limitations of liability.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">14. Governing Law and Dispute Resolution</h3>
              <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive any right to a jury trial or to participate in a class action lawsuit.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">15. Severability</h3>
              <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining provisions of these Terms shall remain in full force and effect.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">16. Entire Agreement</h3>
              <p>These Terms, together with our Privacy Policy and any other legal notices or agreements published by us on the Platform, constitute the entire agreement between you and YidVid concerning your use of the Platform.</p>

              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">17. Contact Us</h3>
              <p>If you have any questions, concerns, or complaints about these Terms of Service, please contact us through the support channels provided on our Platform.</p>
              <h3 className="text-base font-bold text-[#222] dark:!text-[#e8e8e8]">18. Administrative Data Access</h3>
              <p>To maintain the quality and safety of our Platform, authorized administrators may access and review user activity data, including but not limited to watch history, session information, engagement metrics, content interactions, and support request history. This access is used solely for platform management, content moderation, user support, and service improvement purposes. All administrative access is subject to strict internal policies and access controls.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#333]">
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
