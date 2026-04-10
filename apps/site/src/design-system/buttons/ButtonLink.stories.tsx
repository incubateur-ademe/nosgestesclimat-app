// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ButtonLink from './ButtonLink'

const meta: Meta<typeof ButtonLink> = {
  title: 'Design System/Buttons/ButtonLink',
  component: ButtonLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'text', 'success'],
      description: 'The color variant of the button link',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the button link',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank'],
      description: 'The target attribute for the link',
    },
  },
}

export default meta
type Story = StoryObj<typeof ButtonLink>

export const Primary: Story = {
  args: {
    children: 'Primary Link',
    href: '#',
    color: 'primary',
    size: 'md',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Link',
    href: '#',
    color: 'secondary',
    size: 'md',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Link',
    href: '#',
    color: 'success',
    size: 'md',
  },
}

export const Text: Story = {
  args: {
    children: 'Text Link',
    href: '#',
    color: 'text',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Link',
    href: '#',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Link',
    href: '#',
    size: 'lg',
  },
}

export const ExternalLink: Story = {
  args: {
    children: 'External Link',
    href: 'https://example.com',
    target: '_blank',
  },
}
