// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import CopyButton from './CopyButton'

const meta: Meta<typeof CopyButton> = {
  title: 'Design System/Buttons/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    textToCopy: {
      control: 'text',
      description: 'Text to copy to clipboard',
    },
    onCopied: {
      action: 'copied',
      description: 'Callback when text is copied',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text', 'link'],
      description: 'The variant of the button',
    },
    color: {
      control: 'select',
      options: ['primary', 'green', 'red'],
      description: 'The color of the button',
    },
    copiedStateText: {
      control: 'text',
      description: 'Custom text to show when copied',
    },
  },
}

export default meta
type Story = StoryObj<typeof CopyButton>

export const Default: Story = {
  args: {
    textToCopy: 'Text to copy',
  },
}

export const LongText: Story = {
  args: {
    textToCopy:
      'This is a very long text that will be copied to the clipboard when the button is clicked',
  },
}

export const WithCustomClass: Story = {
  args: {
    textToCopy: 'Custom styled button',
    className: 'bg-blue-500 hover:bg-blue-600',
  },
}

export const WithCallback: Story = {
  args: {
    textToCopy: 'Text with callback',
    onCopied: () => console.log('Text copied to clipboard'),
  },
}

export const PrimaryColor: Story = {
  args: {
    textToCopy: 'Primary button',
    variant: 'filled',
    color: 'primary',
  },
}

export const CustomCopiedText: Story = {
  args: {
    textToCopy: 'Custom copied text',
    copiedStateText: '✅ Copied successfully!',
  },
}
