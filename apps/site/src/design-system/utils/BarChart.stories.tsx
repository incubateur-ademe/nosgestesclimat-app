// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import BarChart from './BarChart'

const meta: Meta<typeof BarChart> = {
  title: 'Design System/Utils/BarChart',
  component: BarChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    value: {
      control: 'text',
      description: 'La valeur en pourcentage (ex: "50%").',
    },
    color: {
      control: 'color',
      description: 'Couleur de la barre.',
    },
  },
}

export default meta
type Story = StoryObj<typeof BarChart>

export const Horizontal: Story = {
  args: {
    type: 'horizontal',
    value: '75%',
  },
}

export const Vertical: Story = {
  args: {
    type: 'vertical',
    value: '50%',
  },
  decorators: [
    (Story) => (
      <div className="flex h-48 items-end">
        <Story />
      </div>
    ),
  ],
}

export const CustomColor: Story = {
  args: {
    type: 'horizontal',
    value: '90%',
    color: 'bg-red-500',
  },
}

export const MultipleBars: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <BarChart type="horizontal" value="30%" color="bg-blue-300" />
      <BarChart type="horizontal" value="60%" color="bg-blue-400" />
      <BarChart type="horizontal" value="90%" color="bg-blue-500" />
    </div>
  ),
}
