import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface WelcomeProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — Your gateway to Jewish video content</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logoText}>🎬 {SITE_NAME}</Heading>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Heading style={h1}>
            {name ? `Welcome, ${name}!` : 'Welcome to YidVid!'}
          </Heading>

          <Text style={text}>
            We're thrilled to have you join the {SITE_NAME} community. Get ready to explore a world of inspiring Jewish content, all in one place.
          </Text>

          <Section style={benefitsBox}>
            <Text style={benefitsTitle}>What you can do on {SITE_NAME}:</Text>
            <Text style={benefitItem}>📺 Browse 20,000+ curated Jewish videos</Text>
            <Text style={benefitItem}>🔔 Subscribe to your favorite channels</Text>
            <Text style={benefitItem}>📧 Get notified when new content drops</Text>
            <Text style={benefitItem}>📝 Create and manage playlists</Text>
            <Text style={benefitItem}>💬 Engage with the community</Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={SITE_URL}>
              Start Exploring
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Need help? Visit our <a href={`${SITE_URL}/about`} style={link}>About page</a> or <a href={`${SITE_URL}/settings`} style={link}>contact us</a>.
          </Text>

          <Text style={signoff}>
            — The {SITE_NAME} Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Welcome to ${SITE_NAME}! 🎬`,
  displayName: 'Welcome email',
  previewData: { name: 'Sarah' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = {
  backgroundColor: '#FF0000',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0',
}
const content = { padding: '32px 24px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444444', lineHeight: '1.6', margin: '0 0 24px' }
const benefitsBox = {
  backgroundColor: '#FFF9E0',
  border: '1px solid #FFCC00',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 28px',
}
const benefitsTitle = { fontSize: '15px', fontWeight: 'bold' as const, color: '#1A1A1A', margin: '0 0 12px' }
const benefitItem = { fontSize: '14px', color: '#333333', margin: '0 0 8px', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 28px' }
const button = {
  backgroundColor: '#FF0000',
  color: '#ffffff',
  padding: '14px 36px',
  borderRadius: '6px',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  textDecoration: 'none',
  display: 'inline-block',
}
const divider = { borderColor: '#E5E5E5', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888888', lineHeight: '1.5', margin: '0 0 8px' }
const link = { color: '#FF0000', textDecoration: 'none' }
const signoff = { fontSize: '13px', color: '#888888', margin: '16px 0 0' }
