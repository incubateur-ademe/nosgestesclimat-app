// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import PostalCodeInput from './PostalCodeInput'

const meta: Meta<typeof PostalCodeInput> = {
  title: 'Design System/Inputs/PostalCodeInput',
  component: PostalCodeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const [postalCode, setPostalCode] = useState('')
      return <Story args={{ ...context.args, postalCode, setPostalCode }} />
    },
  ],
  argTypes: {
    postalCode: {
      control: 'text',
      description: 'Current postal code value',
    },
    setPostalCode: {
      control: false,
      description: 'Setter for postal code',
    },
  },
}

export default meta
type Story = StoryObj<typeof PostalCodeInput>

export const Default: Story = {
  args: {},
}

export const WithInitialValue: Story = {
  args: {
    postalCode: '75001',
  },
}

export const Empty: Story = {
  args: {
    postalCode: '',
  },
}
