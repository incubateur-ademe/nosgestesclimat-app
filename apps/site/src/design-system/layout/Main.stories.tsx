// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Main from './Main'

const meta: Meta<typeof Main> = {
  title: 'Design System/Layout/Main',
  component: Main,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'text',
      description: 'Largeur maximale du contenu principal',
    },
    className: {
      control: 'text',
      description: 'Classes CSS additionnelles',
    },
  },
}

export default meta
type Story = StoryObj<typeof Main>

export const Default: Story = {
  args: {
    children: (
      <div className="h-64 bg-gray-100 p-4">Contenu principal de la page.</div>
    ),
  },
}

export const WithMaxWidth: Story = {
  args: {
    ...Default.args,
    maxWidth: '3xl',
  },
}

export const SimulatorPath: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/simulateur/bilan',
      },
    },
  },
}
