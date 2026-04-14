// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import BannerLink from './BannerLink'

const meta: Meta<typeof BannerLink> = {
  title: 'Design System/CMS/Banner/BannerLink',
  component: BannerLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL for the link',
    },
    label: {
      control: 'text',
      description: 'Text label for the link',
    },
  },
}

export default meta
type Story = StoryObj<typeof BannerLink>

export const Default: Story = {
  args: {
    href: '/simulateur',
    label: 'Essayer maintenant',
  },
}

export const LongLabel: Story = {
  args: {
    href: '/blog/article-complet',
    label: "Lire l'article complet sur notre blog",
  },
}

export const ShortLabel: Story = {
  args: {
    href: '/contact',
    label: 'Contact',
  },
}

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    label: 'Visiter le site',
  },
}

export const WithSpecialCharacters: Story = {
  args: {
    href: '/aide/faq',
    label: 'FAQ & Aide',
  },
}
