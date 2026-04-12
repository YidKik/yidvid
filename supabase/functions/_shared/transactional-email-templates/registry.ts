/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcomeEmail } from './welcome.tsx'
import { template as channelRequestConfirmation } from './channel-request-confirmation.tsx'
import { template as contactRequestConfirmation } from './contact-request-confirmation.tsx'
import { template as videoReportAcknowledgment } from './video-report-acknowledgment.tsx'
import { template as channelApproved } from './channel-approved.tsx'
import { template as channelRejected } from './channel-rejected.tsx'
import { template as contactReply } from './contact-reply.tsx'
import { template as videoReportResolved } from './video-report-resolved.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcomeEmail,
  'channel-request-confirmation': channelRequestConfirmation,
  'contact-request-confirmation': contactRequestConfirmation,
  'video-report-acknowledgment': videoReportAcknowledgment,
  'channel-approved': channelApproved,
  'channel-rejected': channelRejected,
  'contact-reply': contactReply,
  'video-report-resolved': videoReportResolved,
}
