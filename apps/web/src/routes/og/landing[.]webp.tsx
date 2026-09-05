import { createFileRoute } from '@tanstack/react-router'
import ImageResponse from 'takumi-js/response'
import { Renderer } from '@takumi-rs/core'
import khand from '@fontsource/khand/files/khand-latin-500-normal.woff2?inline'
import hind from '@fontsource/hind/files/hind-latin-400-normal.woff2?inline'
import { Grid } from '@/components/og/grid'
import { getLogoWordmarkDataUrl } from '@/lib/og-assets'

const renderer = new Renderer()
const fontsReady = Promise.all([
  renderer.registerFont({ name: 'Khand', weight: 500, data: Buffer.from(khand.split(',')[1], 'base64') }),
  renderer.registerFont({ name: 'Hind', weight: 400, data: Buffer.from(hind.split(',')[1], 'base64') }),
])

export const Route = createFileRoute('/og/landing.webp')({
  server: {
    handlers: {
      GET: async () => {
        await fontsReady
        const logoUrl = await getLogoWordmarkDataUrl()
        return new ImageResponse(
          <Grid
            title="Agentic teaching built around your learning"
            description="Practice with katas. Save your progress. Author your own course."
            brand=""
            logo={logoUrl}
          />,
          { width: 1200, height: 630, format: 'webp', renderer },
        )
      },
    },
  },
})
