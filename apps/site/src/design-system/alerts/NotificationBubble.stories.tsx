// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import NotificationBubble from './NotificationBubble'

const meta: Meta<typeof NotificationBubble> = {
  title: 'Design System/Alerts/NotificationBubble',
  component: NotificationBubble,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    number: {
      control: 'number',
      description: 'Number to display in the bubble',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the notification bubble',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-20 w-20 border border-gray-300 p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof NotificationBubble>

export const Default: Story = {
  args: {
    number: 3,
  },
}

export const SingleDigit: Story = {
  args: {
    number: 1,
  },
}

export const DoubleDigit: Story = {
  args: {
    number: 12,
  },
}

export const LargeNumber: Story = {
  args: {
    number: 99,
  },
}

export const WithClickHandler: Story = {
  args: {
    number: 5,
    onClick: () => console.log('Notification bubble clicked'),
  },
}

export const Zero: Story = {
  args: {
    number: 0,
  },
}
