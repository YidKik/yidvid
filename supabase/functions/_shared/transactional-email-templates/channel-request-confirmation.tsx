import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface ChannelRequestProps {
  name?: string
  channelName?: string
}

const ChannelRequestConfirmationEmail = ({ name, channelName }: ChannelRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your channel request — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logoText}>🎬 {SITE_NAME}</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {name ? `Thanks, ${name}!` : 'Thanks for your request!'}
          </Heading>

          <Text style={text}>
            We've received your request to add {channelName ? <strong>{channelName}</strong> : 'a new channel'} to {SITE_NAME}. Our team will review it to make sure it meets our content guidelines.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>What happens next?</strong>
            </Text>
            <Text style={infoText}>
              We review every channel request personally. If the channel meets our guidelines for quality Jewish content, we'll add it to our library. This usually takes 2–5 business days.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={`${SITE_URL}/videos`}>
              Browse Videos
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            We appreciate you helping us grow our content library!
          </Text>
          <Text style={signoff}>— The {SITE_NAME} Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ChannelRequestConfirmationEmail,
  subject: 'We received your channel request',
  displayName: 'Channel request confirmation',
  previewData: { name: 'David', channelName: 'Torah Talks' },
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
const infoText = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0 0 8px' }
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
const footer = { fontSize: '13px', color: '#888888', margin: '0 0 4px' }
const signoff = { fontSize: '13px', color: '#888888', margin: '8px 0 0' }
