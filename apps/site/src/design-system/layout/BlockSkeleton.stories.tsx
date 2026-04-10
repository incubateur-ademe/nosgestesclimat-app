// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import BlockSkeleton from './BlockSkeleton'

const meta: Meta<typeof BlockSkeleton> = {
  title: 'Design System/Layout/BlockSkeleton',
  component: BlockSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BlockSkeleton>

export const Default: Story = {
  render: () => <BlockSkeleton />,
}
