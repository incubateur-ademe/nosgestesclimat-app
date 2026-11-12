// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Subtitle from './Subtitle'

const meta: Meta<typeof Subtitle> = {
  title: 'Design System/Layout/Subtitle',
  component: Subtitle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text', description: 'Classes CSS additionnelles' },
  },
}

export default meta
type Story = StoryObj<typeof Subtitle>

export const Default: Story = {
  args: {
    children: 'Ceci est un sous-titre',
  },
}

export const CustomClass: Story = {
  args: {
    children: 'Sous-titre avec style personnalisé',
    className: 'text-blue-600 italic',
  },
}
