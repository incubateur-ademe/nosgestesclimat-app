// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Alert from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Design System/Alerts/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'The type of alert to display',
    },
    titleTag: {
      control: 'text',
      description: 'The HTML tag to use for the title (defaults to h2)',
    },
    onClose: {
      control: 'boolean',
      description: 'Whether to show the close button',
      mapping: {
        true: () => console.log('Alert closed'),
        false: undefined,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  args: {
    title: 'Default Alert',
    description: 'This is a default alert message.',
    onClose: undefined,
  },
}

export const WithCloseButton: Story = {
  args: {
    title: 'Alert with Close Button',
    description: 'This alert can be closed by clicking the X button.',
    onClose: () => window.alert('Alert closed'),
  },
}

export const Success: Story = {
  args: {
    title: 'Success Alert',
    description: 'This is a success alert message.',
    type: 'success',
    onClose: undefined,
  },
}

export const Warning: Story = {
  args: {
    title: 'Warning Alert',
    description: 'This is a warning alert message.',
    type: 'warning',
    onClose: undefined,
  },
}

export const Error: Story = {
  args: {
    title: 'Error Alert',
    description: 'This is an error alert message.',
    type: 'error',
    onClose: undefined,
  },
}
