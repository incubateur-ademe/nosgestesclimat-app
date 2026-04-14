// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Button from './Button'

const meta: Meta<typeof Button> = {
  title: 'Design System/Buttons/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'text', 'link', 'success'],
      description: 'The color variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size variant of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onClick: {
      action: 'clicked',
      description: 'Optional click handler',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    color: 'primary',
    size: 'md',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    color: 'secondary',
    size: 'md',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Button',
    color: 'success',
    size: 'md',
  },
}

export const Text: Story = {
  args: {
    children: 'Text Button',
    color: 'text',
    size: 'md',
  },
}

export const Link: Story = {
  args: {
    children: 'Link Button',
    color: 'link',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}
