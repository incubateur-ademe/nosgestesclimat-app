// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Form from './Form'

const meta: Meta<typeof Form> = {
  title: 'Design System/Form/Form',
  component: Form,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    buttonLabel: {
      control: 'text',
      description: 'Label for the submit button',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Form submission handler',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof Form>

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    ),
  },
}

export const WithCustomButtonLabel: Story = {
  args: {
    buttonLabel: 'Envoyer le formulaire',
    children: (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    ),
  },
}

export const WithError: Story = {
  args: {
    error: 'Une erreur est survenue lors de la soumission du formulaire',
    children: (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    className: 'max-w-md mx-auto p-6 bg-gray-50 rounded-lg',
    children: (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    ),
  },
}
