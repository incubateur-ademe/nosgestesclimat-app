// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Share from './Share'

const meta: Meta<typeof Share> = {
  title: 'Design System/Sharing/Share',
  component: Share,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    buttonLabel: {
      control: 'text',
      description: 'Label for the share button',
    },
    modalTitle: {
      control: 'text',
      description: 'Title of the share modal',
    },
    modalDescription: {
      control: 'text',
      description: 'Description in the share modal',
    },
    linkShared: {
      control: 'text',
      description: 'URL to be shared',
    },
    shareItems: {
      control: 'object',
      description: 'List of sharing options',
    },
  },
}

export default meta
type Story = StoryObj<typeof Share>

export const Default: Story = {
  args: {
    buttonLabel: 'Partager',
    modalTitle: 'Partager cette page',
    modalDescription: 'Choisissez comment partager cette page',
    linkShared: 'https://nosgestesclimat.fr/simulation',
    shareItems: [
      {
        label: 'Partager sur Facebook',
        icon: '📘',
        link: 'https://www.facebook.com/sharer/sharer.php?u=https://nosgestesclimat.fr/simulation',
      },
      {
        label: 'Partager sur Twitter',
        icon: '🐦',
        link: 'https://twitter.com/intent/tweet?url=https://nosgestesclimat.fr/simulation&text=Découvrez votre empreinte carbone',
      },
      {
        label: 'Partager sur WhatsApp',
        icon: '📱',
        link: 'whatsapp://send?text=Découvrez votre empreinte carbone https://nosgestesclimat.fr/simulation',
        mobileOnly: true,
      },
    ],
  },
}

export const WithEmail: Story = {
  args: {
    buttonLabel: 'Partager par email',
    modalTitle: 'Partager par email',
    modalDescription: 'Envoyez cette page par email',
    linkShared: 'https://nosgestesclimat.fr/simulation',
    shareItems: [
      {
        label: 'Gmail',
        icon: '📧',
        link: 'https://mail.google.com/mail/?view=cm&fs=1&to=&su=Empreinte carbone&body=Découvrez votre empreinte carbone https://nosgestesclimat.fr/simulation',
      },
      {
        label: 'Outlook',
        icon: '📧',
        link: 'https://outlook.live.com/mail/0/deeplink/compose?subject=Empreinte carbone&body=Découvrez votre empreinte carbone https://nosgestesclimat.fr/simulation',
      },
    ],
  },
}

export const LongURL: Story = {
  args: {
    buttonLabel: 'Partager le lien',
    modalTitle: 'Partager cette page',
    modalDescription: 'Copiez le lien ou partagez sur les réseaux sociaux',
    linkShared:
      'https://nosgestesclimat.fr/simulation/resultats?theme=transport&region=france&mode=detaille',
    shareItems: [
      {
        label: 'LinkedIn',
        icon: '💼',
        link: 'https://www.linkedin.com/sharing/share-offsite/?url=https://nosgestesclimat.fr/simulation',
      },
    ],
  },
}
