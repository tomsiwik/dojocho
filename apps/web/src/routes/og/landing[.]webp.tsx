import { createFileRoute } from '@tanstack/react-router'
import ImageResponse from 'takumi-js/response'
import LandingTemplate from '@/components/og/landing-template'
import { getOgBackgroundDataUrl, getLogoWordmarkDataUrl } from '@/lib/og-assets'

export const Route = createFileRoute('/og/landing.webp')({
  server: {
    handlers: {
      GET: async () => {
        const [backgroundUrl, logoUrl] = await Promise.all([
          getOgBackgroundDataUrl(),
          getLogoWordmarkDataUrl(),
        ])
        return new ImageResponse(
          <LandingTemplate backgroundUrl={backgroundUrl} logoUrl={logoUrl} />,
          { width: 1200, height: 630, format: 'webp' },
        )
      },
    },
  },
})
