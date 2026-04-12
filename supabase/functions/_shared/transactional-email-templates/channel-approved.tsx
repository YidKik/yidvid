import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface ChannelApprovedProps {
  name?: string
  channelName?: string
}

const ChannelApprovedEmail = ({ name, channelName }: ChannelApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Great news — your channel request was approved!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logoText}>🎬 {SITE_NAME}</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h1}>
            {name ? `Great news, ${name}! 🎉` : 'Great news! 🎉'}
          </Heading>

          <Text style={text}>
            The channel you requested — {channelName ? <strong>{channelName}</strong> : 'your requested channel'} — has been reviewed and approved! It's now part of the {SITE_NAME} library.
          </Text>

          <Section style={successBox}>
            <Text style={successText}>
              ✅ <strong>{channelName || 'Channel'}</strong> has been added to {SITE_NAME}
            </Text>
          </Section>

          <Text style={text}>
            Thank you for helping us grow our content library. Head over to our channels page to check it out!
          </Text>

          <Section style={ctaSection}>
            <Button style={button} href={`${SITE_URL}/channels`}>
              View All Channels
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Thanks for being part of the {SITE_NAME} community!
          </Text>
          <Text style={signoff}>— The {SITE_NAME} Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ChannelApprovedEmail,
  subject: (data: Record<string, any>) => `Your channel request for ${data.channelName || 'a channel'} was approved!`,
  displayName: 'Channel request approved',
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
const successBox = {
  backgroundColor: '#ecfdf5',
  borderLeft: '4px solid #10b981',
  borderRadius: '4px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const successText = { fontSize: '15px', color: '#065f46', lineHeight: '1.5', margin: '0' }
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
