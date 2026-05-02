'use client'
import { Collapsible as Primitive } from 'radix-ui'
import { forwardRef, useEffect, useState } from 'react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Collapsible = Primitive.Root

const CollapsibleTrigger = Primitive.Trigger

const CollapsibleContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ children, ...props }, ref) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Primitive.Content
      ref={ref}
      {...props}
      className={cn(
        'overflow-hidden',
        mounted &&
          'data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down',
        props.className,
      )}
    >
      {children}
    </Primitive.Content>
  )
})

CollapsibleContent.displayName = Primitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

export type CollapsibleProps = React.ComponentPropsWithoutRef<typeof Primitive.Root>
export type CollapsibleContentProps = React.ComponentPropsWithoutRef<typeof Primitive.Content>
export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<typeof Primitive.Trigger>
