// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ColorLine from './ColorLine'

const meta: Meta<typeof ColorLine> = {
  title: 'Design System/Layout/ColorLine',
  component: ColorLine,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Classes CSS pour personnaliser la ligne',
    },
    style: {
      control: 'object',
      description: 'Styles CSS en ligne',
    },
  },
}

export default meta

type Story = StoryObj<typeof ColorLine>

export const Default: Story = {
  args: {
    className: 'h-2 w-32',
  },
}

export const Vertical: Story = {
  args: {
    className: 'h-32 w-2',
  },
}

export const CustomColor: Story = {
  args: {
    className: 'h-2 w-32 bg-green-500',
  },
}

export const CustomStyle: Story = {
  args: {
    className: 'h-2 w-32',
    style: {
      background: 'linear-gradient(to right, red, blue)',
    },
  },
}
