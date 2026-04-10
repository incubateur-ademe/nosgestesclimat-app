// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Separator from './Separator'

const meta: Meta<typeof Separator> = {
  title: 'Design System/Layout/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description:
        'Classes CSS additionnelles pour personnaliser le séparateur',
    },
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {
  args: {},
}

export const CustomClass: Story = {
  args: {
    className: 'bg-red-500 h-1 w-32 my-4',
  },
}
