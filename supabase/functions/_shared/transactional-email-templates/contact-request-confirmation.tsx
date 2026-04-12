import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.co"
const LOGO_URL = "https://yidvid.lovable.app/yidvid-logo-full.png"

interface ContactConfirmationProps {
  name?: string
}

const ContactRequestConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your message — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} height="56" style={logo} />
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {name ? `Thank you, ${name}!` : 'Thank you for reaching out!'}
          </Heading>

          <Text style={text}>
            We've received your message and appreciate you taking the time to contact us. Our team will review it and get back to you as soon as possible.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              We typically respond within <strong>24–48 hours</strong>. If your matter is urgent, feel free to email us directly at <a href="mailto:yidvid.info@gmail.com" style={link}>yidvid.info@gmail.com</a>.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={SITE_URL}>
              Back to {SITE_NAME}
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
  component: ContactRequestConfirmationEmail,
  subject: 'We received your message',
  displayName: 'Contact request confirmation',
  previewData: { name: 'Rachel' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = {
  backgroundColor: '#FF0000',
  padding: '28px 24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const logo = { height: '56px', width: 'auto', margin: '0 auto' }
const content = { padding: '32px 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 20px' }
const infoBox = {
  backgroundColor: '#FFF9E0',
  border: '1px solid #FFCC00',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const infoText = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0' }
const link = { color: '#FF0000', textDecoration: 'none' }
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
