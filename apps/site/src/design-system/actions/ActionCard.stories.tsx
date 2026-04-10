// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ActionCard from './ActionCard'

const meta: Meta<typeof ActionCard> = {
  title: 'Design System/Actions/ActionCard',
  component: ActionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icons: {
      control: 'text',
      description: 'Emoji icons to display',
    },
    footprintAvoided: {
      control: 'number',
      description: 'Carbon footprint avoided in kg',
    },
    title: {
      control: 'text',
      description: 'Title of the action',
    },
    tag: {
      control: 'select',
      options: ['div', 'button', 'a'],
      description: 'HTML tag to render the card as',
    },
    href: {
      control: 'text',
      description: 'URL for link variant',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for button variant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof ActionCard>

export const Default: Story = {
  args: {
    icons: '🚗',
    footprintAvoided: 500,
    title: 'Prendre les transports en commun',
  },
}

export const WithMultipleIcons: Story = {
  args: {
    icons: '🚲🚶‍♂️',
    footprintAvoided: 300,
    title: 'Marche et vélo pour les trajets courts',
  },
}

export const HighImpact: Story = {
  args: {
    icons: '✈️',
    footprintAvoided: 2000,
    title: 'Éviter un vol long-courrier',
  },
}

export const AsButton: Story = {
  args: {
    icons: '🌱',
    footprintAvoided: 150,
    title: 'Manger moins de viande',
    tag: 'button',
    onClick: () => console.log('Action card clicked'),
  },
}

export const AsLink: Story = {
  args: {
    icons: '💡',
    footprintAvoided: 100,
    title: 'Installer des LED',
    tag: 'a',
    href: '/actions/led',
  },
}
