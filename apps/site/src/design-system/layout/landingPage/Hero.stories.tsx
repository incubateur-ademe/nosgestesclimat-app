// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Hero from './Hero'

const meta: Meta<typeof Hero> = {
  title: 'Design System/Layout/LandingPage/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Hero>

export const Default: Story = {
  args: {
    title: 'Titre du Héros',
    description:
      'Description qui accompagne le titre et présente la page de manière concise.',
    illustration: (
      <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gray-300">
        Illustration
      </div>
    ),
  },
}

export const WithPartners: Story = {
  args: {
    ...Default.args,
    partners: (
      <div className="flex items-center gap-4">
        <span>Partenaire 1</span>
        <span>Partenaire 2</span>
      </div>
    ),
  },
}

export const CustomStyle: Story = {
  args: {
    ...Default.args,
    className: 'bg-yellow-100',
    style: {
      borderBottom: '5px solid #FBBF24',
    },
  },
}
