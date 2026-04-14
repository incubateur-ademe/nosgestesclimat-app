// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Badge from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Design System/Layout/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'green', 'red'],
      description: 'Color variant of the badge',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
      description: 'Size variant of the badge',
    },
    category: {
      control: 'text',
      description: 'Category name for dynamic color styling',
    },
    tag: {
      control: 'select',
      options: ['div', 'span', 'p'],
      description: 'HTML tag to render the badge as',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Badge',
    color: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Badge',
    color: 'secondary',
  },
}

export const Green: Story = {
  args: {
    children: 'Green Badge',
    color: 'green',
  },
}

export const Red: Story = {
  args: {
    children: 'Red Badge',
    color: 'red',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Badge',
    size: 'sm',
  },
}

export const ExtraSmall: Story = {
  args: {
    children: 'XS Badge',
    size: 'xs',
  },
}

export const WithCategory: Story = {
  args: {
    children: 'Écologie',
    category: 'écologie',
  },
}

export const AsSpan: Story = {
  args: {
    children: 'Inline Badge',
    tag: 'span',
  },
}

export const LongText: Story = {
  args: {
    children: 'Badge avec texte très long',
  },
}
