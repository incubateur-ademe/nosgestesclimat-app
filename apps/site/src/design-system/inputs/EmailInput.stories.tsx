// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import EmailInput from './EmailInput'

const meta: Meta<typeof EmailInput> = {
  title: 'Design System/Inputs/EmailInput',
  component: EmailInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the email input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the label',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    value: {
      control: 'text',
      description: 'Current value of the input',
    },
  },
}

export default meta
type Story = StoryObj<typeof EmailInput>

export const Default: Story = {
  args: {
    label: 'Adresse email',
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Adresse email',
    helperText: 'Nous ne partagerons jamais votre email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Adresse email',
    error: 'Veuillez entrer une adresse email valide',
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'Adresse email',
    value: 'utilisateur@exemple.fr',
    readOnly: true,
  },
}

export const WithValue: Story = {
  args: {
    label: 'Adresse email',
    value: 'utilisateur@exemple.fr',
  },
}

export const WithCustomStyling: Story = {
  args: {
    label: 'Adresse email',
    className: 'bg-blue-50 p-4 rounded-lg',
  },
}

export const LongLabel: Story = {
  args: {
    label: 'Adresse email de contact pour les communications importantes',
  },
}
