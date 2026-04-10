// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import TextInput from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Design System/Inputs/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Name attribute for the input',
    },
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Current value of the input',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the label',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the field is read-only',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum length of input',
    },
    debounceTimeout: {
      control: 'number',
      description: 'Debounce timeout in milliseconds',
    },
    mention: {
      control: 'text',
      description: 'Additional mention text to display next to label',
    },
    onChange: {
      action: 'changed',
      description: 'Change handler',
    },
  },
}

export default meta
type Story = StoryObj<typeof TextInput>

export const Default: Story = {
  args: {
    name: 'example',
    label: 'Nom',
    placeholder: 'Entrez votre nom',
  },
}

export const WithHelperText: Story = {
  args: {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'exemple@email.com',
    helperText: 'Nous ne partagerons jamais votre email',
  },
}

export const WithError: Story = {
  args: {
    name: 'password',
    label: 'Mot de passe',
    type: 'password',
    placeholder: 'Entrez votre mot de passe',
    error: 'Le mot de passe doit contenir au moins 8 caractères',
  },
}

export const WithSuccess: Story = {
  args: {
    name: 'username',
    label: "Nom d'utilisateur",
    placeholder: "Choisissez un nom d'utilisateur",
  },
}

export const Required: Story = {
  args: {
    name: 'required-field',
    label: 'Champ obligatoire',
    placeholder: 'Ce champ est requis',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    name: 'disabled-field',
    label: 'Champ désactivé',
    placeholder: 'Ce champ est désactivé',
    disabled: true,
    value: 'Valeur non modifiable',
  },
}

export const ReadOnly: Story = {
  args: {
    name: 'readonly-field',
    label: 'Champ en lecture seule',
    value: 'Valeur en lecture seule',
    readOnly: true,
  },
}

export const WithMaxLength: Story = {
  args: {
    name: 'limited-field',
    label: 'Champ avec limite',
    placeholder: 'Maximum 10 caractères',
    maxLength: 10,
  },
}

export const NumberInput: Story = {
  args: {
    name: 'age',
    label: 'Âge',
    type: 'number',
    placeholder: 'Entrez votre âge',
  },
}

export const EmailInput: Story = {
  args: {
    name: 'email',
    label: 'Adresse email',
    type: 'email',
    placeholder: 'exemple@domaine.com',
  },
}

export const WithMention: Story = {
  args: {
    name: 'optional-field',
    label: 'Champ optionnel',
    placeholder: 'Ce champ est optionnel',
    mention: 'Optionnel',
  },
}
