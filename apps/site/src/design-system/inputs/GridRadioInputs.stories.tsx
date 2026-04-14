// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'
import GridRadioInputs from './GridRadioInputs'

const meta: Meta<typeof GridRadioInputs> = {
  title: 'Design System/Inputs/GridRadioInputs',
  component: GridRadioInputs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Name attribute for the radio group',
    },
    label: {
      control: 'text',
      description: 'Label for the radio group',
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
    containerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
    value: {
      control: 'text',
      description: 'Current value of the radio group',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
  },
  decorators: [
    (Story, context) => {
      const { control } = useForm()
      return (
        <form>
          <Story args={{ ...context.args, control }} />
        </form>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof GridRadioInputs>

const mockItems = [
  { value: '1', label: '1', ariaLabel: 'Option 1' },
  { value: '2', label: '2', ariaLabel: 'Option 2' },
  { value: '3', label: '3', ariaLabel: 'Option 3' },
  { value: '4', label: '4', ariaLabel: 'Option 4' },
  { value: '5', label: '5', ariaLabel: 'Option 5' },
]

const emojiItems = [
  { value: 'car', label: '🚗', ariaLabel: 'Voiture' },
  { value: 'bike', label: '🚲', ariaLabel: 'Vélo' },
  { value: 'walk', label: '🚶‍♂️', ariaLabel: 'Marche' },
  { value: 'bus', label: '🚌', ariaLabel: 'Bus' },
  { value: 'train', label: '🚆', ariaLabel: 'Train' },
]

export const Default: Story = {
  args: {
    name: 'example',
    label: 'Sélectionnez une option',
    items: mockItems,
  },
}

export const WithEmojis: Story = {
  args: {
    name: 'transport',
    label: 'Mode de transport préféré',
    items: emojiItems,
  },
}

export const WithHelperText: Story = {
  args: {
    name: 'example-helper',
    label: 'Notez votre satisfaction',
    helperText: 'De 1 (très insatisfait) à 5 (très satisfait)',
    items: mockItems,
  },
}

export const WithError: Story = {
  args: {
    name: 'example-error',
    label: 'Sélectionnez une option',
    error: 'Veuillez sélectionner une option',
    items: mockItems,
  },
}

export const Required: Story = {
  args: {
    name: 'example-required',
    label: 'Option obligatoire',
    required: true,
    items: mockItems,
  },
}

export const WithCustomStyling: Story = {
  args: {
    name: 'example-custom',
    label: 'Select avec style personnalisé',
    containerClassName: 'bg-blue-50 p-4 rounded-lg',
    items: mockItems,
  },
}

export const WithDefaultValue: Story = {
  args: {
    name: 'example-default',
    label: 'Select avec valeur par défaut',
    value: '3',
    items: mockItems,
  },
}

export const ManyOptions: Story = {
  args: {
    name: 'example-many',
    label: "Beaucoup d'options",
    items: [
      { value: 'a', label: 'A', ariaLabel: 'Option A' },
      { value: 'b', label: 'B', ariaLabel: 'Option B' },
      { value: 'c', label: 'C', ariaLabel: 'Option C' },
      { value: 'd', label: 'D', ariaLabel: 'Option D' },
      { value: 'e', label: 'E', ariaLabel: 'Option E' },
      { value: 'f', label: 'F', ariaLabel: 'Option F' },
      { value: 'g', label: 'G', ariaLabel: 'Option G' },
      { value: 'h', label: 'H', ariaLabel: 'Option H' },
    ],
  },
}
