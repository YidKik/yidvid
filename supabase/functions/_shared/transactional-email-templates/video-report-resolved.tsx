import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YidVid"
const SITE_URL = "https://yidvid.com"

interface VideoReportResolvedProps {
  name?: string
  videoTitle?: string
  channelName?: string
}

const VideoReportResolvedEmail = ({ name, videoTitle, channelName }: VideoReportResolvedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Action taken on your report — {SITE_NAME}</Preview>
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
            Thank you so much for helping us keep {SITE_NAME} safe! We wanted to let you know that the video you reported has been reviewed and <strong>removed from our platform</strong>.
          </Text>

          {videoTitle && (
            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Video removed:</strong> {videoTitle}
              </Text>
              {channelName && (
                <Text style={infoText}>
                  <strong>Channel:</strong> {channelName}
                </Text>
              )}
            </Section>
          )}

          <Text style={text}>
            Your report made a real difference. Community members like you are what keeps {SITE_NAME} a safe and enjoyable experience for everyone.
          </Text>

          <Section style={ctaSection}>
            <Button style={button} href={`${SITE_URL}/videos`}>
              Continue Watching
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Thank you for being part of the {SITE_NAME} community!
          </Text>
          <Text style={signoff}>— The {SITE_NAME} Team</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: VideoReportResolvedEmail,
  subject: 'Action taken on your video report',
  displayName: 'Video report resolved',
  previewData: { name: 'Moshe', videoTitle: 'Inappropriate Video', channelName: 'Some Channel' },
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
const infoText = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0 0 4px' }
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
