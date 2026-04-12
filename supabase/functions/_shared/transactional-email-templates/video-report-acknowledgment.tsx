import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface VideoReportProps {
  name?: string
}

const VideoReportAcknowledgmentEmail = ({ name }: VideoReportProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reporting — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logoText}>🎬 {SITE_NAME}</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {name ? `Thank you, ${name}!` : 'Thank you for your report!'}
          </Heading>

          <Text style={text}>
            We've received your video report and truly appreciate you helping us keep {SITE_NAME} a safe and enjoyable platform for everyone.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              Our moderation team reviews every report carefully. We'll take appropriate action if the content violates our community guidelines. Reviews are typically completed within <strong>24–48 hours</strong>.
            </Text>
          </Section>

          <Text style={text}>
            Your vigilance helps us maintain a high-quality experience for the entire community. Thank you for being part of the solution!
          </Text>

          <Section style={ctaSection}>
            <Button style={button} href={`${SITE_URL}/videos`}>
              Continue Watching
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={signoff}>— The {SITE_NAME} Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: VideoReportAcknowledgmentEmail,
  subject: 'Thanks for keeping YidVid safe',
  displayName: 'Video report acknowledgment',
  previewData: { name: 'Moshe' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = {
  backgroundColor: '#FF0000',
  padding: '28px 24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const logoText = { color: '#ffffff', fontSize: '24px', fontWeight: 'bold' as const, margin: '0' }
const content = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 20px' }
const infoBox = {
  backgroundColor: '#F5F5F5',
  borderLeft: '4px solid #FFCC00',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const infoText = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = {
  backgroundColor: '#FF0000',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  fontWeight: 'bold' as const,
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
}
const divider = { borderColor: '#E5E5E5', margin: '20px 0' }
const signoff = { fontSize: '13px', color: '#888888', margin: '8px 0 0' }
