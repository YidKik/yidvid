import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface ContactReplyProps {
  name?: string
  adminReply?: string
  originalMessage?: string
  category?: string
}

const ContactReplyEmail = ({ name, adminReply, originalMessage, category }: ContactReplyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've responded to your message — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logoText}>🎬 {SITE_NAME}</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {name ? `Hi ${name},` : 'Hi there,'}
          </Heading>

          <Text style={text}>
            We've responded to your {category ? category.replace('_', ' ') : ''} request. Here's our reply:
          </Text>

          <Section style={replyBox}>
            <Text style={replyText}>
              {adminReply || 'No reply content'}
            </Text>
          </Section>

          {originalMessage && (
            <>
              <Text style={labelText}>Your original message:</Text>
              <Section style={originalBox}>
                <Text style={originalText}>
                  {originalMessage}
                </Text>
              </Section>
            </>
          )}

          <Text style={text}>
            If you have any further questions, feel free to reach out to us at <a href="mailto:yidvid.info@gmail.com" style={{ color: '#FF0000', textDecoration: 'none' }}>yidvid.info@gmail.com</a>
          </Text>

          <Section style={ctaSection}>
            <Button style={button} href={SITE_URL}>
              Visit {SITE_NAME}
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
  component: ContactReplyEmail,
  subject: (data: Record<string, any>) => `Re: Your ${data.category?.replace('_', ' ') || ''} request`,
  displayName: 'Contact request reply',
  previewData: { name: 'Sarah', adminReply: 'Thank you for reaching out! We have addressed your concern.', originalMessage: 'I had a question about...', category: 'general' },
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
const replyBox = {
  backgroundColor: '#fff5f5',
  borderLeft: '4px solid #FF0000',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const replyText = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '0' }
const labelText = { fontSize: '13px', fontWeight: 'bold' as const, color: '#888888', margin: '0 0 8px' }
const originalBox = {
  backgroundColor: '#F5F5F5',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const originalText = { fontSize: '13px', color: '#666666', lineHeight: '1.5', margin: '0' }
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
