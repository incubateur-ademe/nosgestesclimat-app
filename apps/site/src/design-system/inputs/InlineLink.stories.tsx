// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import InlineLink from './InlineLink'

const meta: Meta<typeof InlineLink> = {
  title: 'Design System/Inputs/InlineLink',
  component: InlineLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL for the link',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    title: {
      control: 'text',
      description: 'Title attribute for the link',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the link',
    },
    target: {
      control: 'text',
      description: 'Target attribute for the link',
    },
  },
}

export default meta
type Story = StoryObj<typeof InlineLink>

export const Default: Story = {
  args: {
    href: '/aide',
    children: 'En savoir plus',
  },
}

export const WithTitle: Story = {
  args: {
    href: '/aide',
    title: "Lien vers la page d'aide",
    children: 'Aide',
  },
}

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    children: 'Lien externe',
  },
}

export const WithCustomStyling: Story = {
  args: {
    href: '/contact',
    className: 'text-blue-600 font-bold',
    children: 'Contactez-nous',
  },
}

export const LongText: Story = {
  args: {
    href: '/blog/article-tres-long',
    children:
      'Un lien avec un texte très long qui pourrait déborder sur plusieurs lignes',
  },
}

export const WithCallback: Story = {
  args: {
    href: '/example',
    onClick: () => console.log('Inline link clicked'),
    children: 'Lien avec callback',
  },
}

export const ShortText: Story = {
  args: {
    href: '/',
    children: 'Accueil',
  },
}
