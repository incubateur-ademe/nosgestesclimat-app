import { marianne } from '@/app/[locale]/marianne'
import CheckCircleIcon from '@/components/icons/status/CheckCircleIcon'
import {
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="mr-6 block size-6 min-w-6 fill-green-600" />
        ),
        info: <InfoIcon className="mr-4 size-5 stroke-blue-500" />,
        warning: (
          <TriangleAlertIcon className="mr-4 size-5 stroke-orange-500" />
        ),
        error: <OctagonXIcon className="mr-4 size-5 stroke-red-500" />,
        loading: <Loader2Icon className="mr-4 size-5 animate-spin" />,
      }}
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          ...marianne.style,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
