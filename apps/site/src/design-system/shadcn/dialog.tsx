import { cn } from 'cn'
import { Dialog as DialogPrimitive } from 'radix-ui'
import * as React from 'react'

import TransClient from '@/components/translation/trans/TransClient'
import { XIcon } from 'lucide-react'
import Button from '../buttons/Button'

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-xs',
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay className="z-1000" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'z-1001',
          'bg-popover text-popover-foreground ring-foreground/10',
          'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
          'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          'fixed top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)]',
          '-translate-x-1/2 -translate-y-1/2',
          'flex flex-col',
          'gap-4 rounded-xl p-8 text-sm ring-1 duration-100 outline-none sm:max-w-lg',
          className
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <button className="absolute top-4 right-4 flex size-6 items-center justify-center">
              <XIcon />
              <span className="sr-only">
                <TransClient i18nKey="common.close">Fermer</TransClient>
              </span>
            </button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCancelButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCancelButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-4 rounded-b-xl p-4 sm:flex-row sm:justify-start',
        className
      )}
      {...props}>
      {children}
      {showCancelButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outlined">
            <TransClient i18nKey="common.cancel">Annuler</TransClient>
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
  isShowingCancelButton?: boolean
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('mb-8 text-2xl/none font-normal', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
