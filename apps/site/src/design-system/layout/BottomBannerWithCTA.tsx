import { cn } from 'cn'

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode
}

export default function BottomBannerWithCTA({ children, className }: Props) {
  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-10 flex min-h-20 w-full items-center justify-center bg-white p-4 px-6 shadow-[0_-4px_14px_0_rgba(0,0,0,0.10)]',
        className
      )}>
      {children}
    </div>
  )
}
