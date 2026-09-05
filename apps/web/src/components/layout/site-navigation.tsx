'use client'

import { BrandLogo } from '@dojofoo/ui/brand-logo'
import { SiteNavigation as SharedSiteNavigation } from '@dojofoo/ui/site-navigation'
import { Link, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { SearchToggle } from './search-toggle'

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
  const section = useLocation({ select: (location) => location.pathname.split('/')[1] })
  const isDocumentation = section === 'docs' || section === 'developers' || section === 'authoring'

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
      actions={(
        <>
          <Link
            to="/dojos"
            className={`px-3 py-2 text-sm font-medium transition-colors duration-80 hover:text-foreground max-md:hidden ${section === 'dojos' || section === 'courses' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Dojos
          </Link>
          <Link
            to="/$"
            params={{ _splat: 'docs' }}
            aria-current={isDocumentation ? 'location' : undefined}
            className={`px-3 py-2 text-sm font-medium transition-colors duration-80 hover:text-foreground max-md:hidden ${isDocumentation ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Docs
          </Link>
          {mobileAction}
          <SearchToggle size="icon" showShortcut className="text-muted-foreground [&_svg]:!size-5" />
        </>
      )}
    />
  )
}
