// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import InlineTextInput from './InlineTextInput'

const meta: Meta<typeof InlineTextInput> = {
  title: 'Design System/Inputs/InlineTextInput',
  component: InlineTextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Name attribute for the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
      description: 'Type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    defaultValue: {
      control: 'text',
      description: 'Default value for the input',
    },
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the input is in loading state',
    },
    onClose: {
      action: 'closed',
      description: 'Handler for closing the input',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Handler for submitting the input value',
    },
  },
}

export default meta
type Story = StoryObj<typeof InlineTextInput>

export const Default: Story = {
  args: {
    name: 'example',
    label: 'Nom du groupe',
    placeholder: 'Entrez le nom du groupe',
  },
}

export const WithDefaultValue: Story = {
  args: {
    name: 'example-default',
    label: 'Nom du groupe',
    defaultValue: 'Mon groupe',
    placeholder: 'Entrez le nom du groupe',
  },
}

export const EmailType: Story = {
  args: {
    name: 'email',
    type: 'email',
    label: 'Adresse email',
    placeholder: 'exemple@email.com',
  },
}

export const NumberType: Story = {
  args: {
    name: 'age',
    type: 'number',
    label: 'Âge',
    placeholder: 'Entrez votre âge',
  },
}

export const Loading: Story = {
  args: {
    name: 'example-loading',
    label: 'Nom du groupe',
    placeholder: 'Entrez le nom du groupe',
    isLoading: true,
  },
}

export const LongLabel: Story = {
  args: {
    name: 'example-long',
    label:
      "Un label très long qui pourrait déborder sur plusieurs lignes pour tester l'affichage",
    placeholder: 'Entrez une valeur',
  },
}

export const WithCustomCallbacks: Story = {
  args: {
    name: 'example-callbacks',
    label: 'Nom du groupe',
    placeholder: 'Entrez le nom du groupe',
    onClose: () => console.log('Input closed'),
    onSubmit: (value) => console.log('Submitted:', value),
  },
}
