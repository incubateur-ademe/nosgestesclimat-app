// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Loader from './Loader'

const meta: Meta<typeof Loader> = {
  title: 'Design System/Layout/Loader',
  component: Loader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
      description: 'Taille du loader',
    },
    color: {
      control: {
        type: 'select',
        options: ['light', 'dark'],
      },
      description: 'Couleur du loader',
    },
    className: {
      control: 'text',
      description: 'Classes CSS additionnelles',
    },
    ariaLabel: {
      control: 'text',
      description: "Texte descriptif pour les lecteurs d'écran",
    },
  },
}

export default meta
type Story = StoryObj<typeof Loader>

const lightBackgroundDecorator = (Story: () => React.ReactElement) => (
  <div className="h-full w-full p-4">
    <Story />
  </div>
)

const darkBackgroundDecorator = (Story: () => React.ReactElement) => (
  <div className="h-full w-full bg-gray-800 p-4">
    <Story />
  </div>
)

export const Default: Story = {
  args: {},
  decorators: [darkBackgroundDecorator],
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
  decorators: [darkBackgroundDecorator],
}

export const SmallDark: Story = {
  args: {
    size: 'sm',
    color: 'dark',
  },
  decorators: [lightBackgroundDecorator],
}

export const LargeDark: Story = {
  args: {
    size: 'lg',
    color: 'dark',
  },
  decorators: [lightBackgroundDecorator],
}

export const CustomClass: Story = {
  args: {
    size: 'lg',
    className: 'border-green-500 border-b-transparent',
  },
  decorators: [darkBackgroundDecorator],
}

export const WithCustomAriaLabel: Story = {
  args: {
    size: 'md',
    color: 'dark',
    ariaLabel: 'Chargement des données utilisateur',
  },
  decorators: [lightBackgroundDecorator],
}
