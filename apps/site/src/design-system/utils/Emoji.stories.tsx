// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Emoji from './Emoji'

const meta: Meta<typeof Emoji> = {
  title: 'Design System/Utils/Emoji',
  component: Emoji,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Emoji text to render',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof Emoji>

export const Default: Story = {
  args: {
    children: '😊',
  },
}

export const MultipleEmojis: Story = {
  args: {
    children: '🚗🚲🚶‍♂️',
  },
}

export const WithText: Story = {
  args: {
    children: 'Hello 👋 world 🌍',
  },
}

export const LargeSize: Story = {
  args: {
    children: '🎉',
    className: 'text-4xl',
  },
}

export const SmallSize: Story = {
  args: {
    children: '💡',
    className: 'text-sm',
  },
}

export const CustomStyling: Story = {
  args: {
    children: '🌟',
    className: 'text-yellow-500 text-2xl',
  },
}

export const MultipleWithSpacing: Story = {
  args: {
    children: '🌱 🌿 🌳',
    className: 'space-x-2',
  },
}
