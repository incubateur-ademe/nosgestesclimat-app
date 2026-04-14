// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Label from './Label'

const meta: Meta<typeof Label> = {
  title: 'Design System/Inputs/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOptional: {
      control: 'boolean',
      description: 'Whether to show the optional indicator',
    },
  },
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Nom complet',
  },
}

export const Optional: Story = {
  args: {
    children: 'Téléphone',
    isOptional: true,
  },
}

export const LongText: Story = {
  args: {
    children: 'Adresse de livraison complète avec code postal',
  },
}

export const LongTextOptional: Story = {
  args: {
    children: 'Informations complémentaires sur votre profil',
    isOptional: true,
  },
}
