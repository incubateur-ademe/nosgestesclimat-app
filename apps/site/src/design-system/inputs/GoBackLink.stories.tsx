// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import GoBackLink from './GoBackLink'

const meta: Meta<typeof GoBackLink> = {
  title: 'Design System/Inputs/GoBackLink',
  component: GoBackLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL to go back to',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof GoBackLink>

export const Default: Story = {
  args: {
    href: '/',
  },
}

export const WithCustomClass: Story = {
  args: {
    href: '/simulation',
    className: 'text-lg font-bold',
  },
}

export const WithTracking: Story = {
  args: {
    href: '/blog',
  },
}

export const LongPath: Story = {
  args: {
    href: '/simulation/resultats/empreinte-carbone',
  },
}
