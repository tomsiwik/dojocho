import { GithubIcon } from '@/components/github-icon'
import { BrandLogo } from '@dojofoo/ui/brand-logo'
import type { BaseLayoutProps } from '@/components/layout/shared'

export const gitConfig = {
  user: 'dojofoo',
  repo: 'dojofoo',
  branch: 'main',
}

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // SVG wordmark — the variant designed for the docs nav.
      title: <BrandLogo className="h-7" />,
      url: '/',
    },
    // Explicit links list (instead of the `githubUrl` shortcut) so we can use
    // the lucide GithubIcon — same icon the landing page uses, for visual
    // consistency between frontpage and docs nav.
    links: [
      {
        type: 'icon',
        url: githubUrl,
        text: 'GitHub',
        label: 'GitHub',
        icon: <GithubIcon />,
        external: true,
      },
    ],
  }
}
