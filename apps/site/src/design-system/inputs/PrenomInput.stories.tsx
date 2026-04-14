// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import PrenomInput from './PrenomInput'

const meta: Meta<typeof PrenomInput> = {
  title: 'Design System/Inputs/PrenomInput',
  component: PrenomInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Valeur du champ prénom' },
    error: { control: 'text', description: "Message d'erreur à afficher" },
  },
}

export default meta

type Story = StoryObj<typeof PrenomInput>

export const Default: Story = {
  args: {},
}

export const WithValue: Story = {
  args: { value: 'Benjamin' },
}

export const WithError: Story = {
  args: {
    value: 'Ben',
    error: 'Le prénom doit contenir au moins 4 caractères.',
  },
}
