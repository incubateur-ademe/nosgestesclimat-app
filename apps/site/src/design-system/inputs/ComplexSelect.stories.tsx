// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ComplexSelect from './ComplexSelect'

const meta: Meta<typeof ComplexSelect> = {
  title: 'Design System/Inputs/ComplexSelect',
  component: ComplexSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Name attribute for the select',
    },
    label: {
      control: 'text',
      description: 'Label for the select field',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the label',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    value: {
      control: 'text',
      description: 'Current value of the select',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    isMulti: {
      control: 'boolean',
      description: 'Whether multiple values can be selected',
    },
    isClearable: {
      control: 'boolean',
      description: 'Whether the select can be cleared',
    },
    isSearchable: {
      control: 'boolean',
      description: 'Whether the select is searchable',
    },
    isAsync: {
      control: 'boolean',
      description: 'Whether to use async select',
    },
    onChange: {
      action: 'changed',
      description: 'Change handler',
    },
  },
}

export default meta
type Story = StoryObj<typeof ComplexSelect>

const simpleOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']

const groupedOptions = [
  {
    label: 'Catégorie 1',
    options: ['Sous-option 1.1', 'Sous-option 1.2'],
  },
  {
    label: 'Catégorie 2',
    options: ['Sous-option 2.1', 'Sous-option 2.2'],
  },
]

export const Default: Story = {
  args: {
    name: 'example',
    label: 'Sélectionnez une option',
    options: simpleOptions,
  },
}

export const WithHelperText: Story = {
  args: {
    name: 'example-helper',
    label: 'Sélectionnez votre région',
    helperText: 'Cette information nous aide à personnaliser votre expérience',
    options: simpleOptions,
  },
}

export const WithError: Story = {
  args: {
    name: 'example-error',
    label: 'Sélectionnez une option',
    error: 'Veuillez sélectionner une option',
    options: simpleOptions,
  },
}

export const MultiSelect: Story = {
  args: {
    name: 'example-multi',
    label: 'Sélectionnez plusieurs options',
    isMulti: true,
    isClearable: true,
    options: simpleOptions,
  },
}

export const Searchable: Story = {
  args: {
    name: 'example-searchable',
    label: 'Recherchez une option',
    isSearchable: true,
    isClearable: true,
    options: simpleOptions,
  },
}

export const GroupedOptions: Story = {
  args: {
    name: 'example-grouped',
    label: 'Sélectionnez une option groupée',
    options: groupedOptions,
  },
}

export const Required: Story = {
  args: {
    name: 'example-required',
    label: 'Option obligatoire',
    required: true,
    options: simpleOptions,
  },
}

export const WithCustomStyling: Story = {
  args: {
    name: 'example-custom',
    label: 'Select avec style personnalisé',
    className: 'bg-blue-50 p-4 rounded-lg',
    options: simpleOptions,
  },
}

export const WithDefaultValue: Story = {
  args: {
    name: 'example-default',
    label: 'Select avec valeur par défaut',
    value: 'Option 2',
    options: simpleOptions,
  },
}
