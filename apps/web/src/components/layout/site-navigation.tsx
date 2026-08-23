'use client'

import { Button, buttonVariants } from '@dojofoo/ui/button'
import { BrandLogo } from '@dojofoo/ui/brand-logo'
import { SiteNavigation as SharedSiteNavigation } from '@dojofoo/ui/site-navigation'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { GithubIcon } from '@/components/github-icon'
import { cn } from '@/lib/utils'
import { gitConfig } from '@/lib/layout.shared'
import { SearchToggle } from './search-toggle'
import { ThemeToggle } from './theme-toggle'

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`

interface SiteNavigationProps {
  as?: 'header' | 'div'
  mobileAction?: ReactNode
  className?: string
}

export function SiteNavigation({
  as: Component = 'header',
  mobileAction,
  className,
}: SiteNavigationProps) {
  return (
    <SharedSiteNavigation
      as={Component}
      data-site-navigation=""
      className={className}
      brand={(
        <Link to="/" aria-label="Dojofoo courses" className="mr-1 flex items-center">
          <BrandLogo />
        </Link>
      )}
      leading={<SearchToggle size="icon" showShortcut className="text-muted-foreground [&_svg]:!size-5" />}
      actions={(
        <>
          <Link
            to="/$"
            params={{ _splat: 'docs' }}
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-80 hover:text-foreground max-md:hidden"
          >
            Docs
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={cn(
              buttonVariants({ size: 'icon', variant: 'ghost' }),
              'text-muted-foreground max-sm:hidden [&_svg]:!size-5',
            )}
          >
            <GithubIcon />
          </a>
          <ThemeToggle className="max-sm:hidden" />
          <Button
            asChild
            variant="cta"
            className="ml-1 rounded-[2px]"
          >
            <Link to="/$" params={{ _splat: 'docs/installation' }}>
              <span>Get Started</span>
            </Link>
          </Button>
          {mobileAction}
        </>
      )}
    />
  )
}
