// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Title from './Title'

const meta: Meta<typeof Title> = {
  title: 'Design System/Layout/Title',
  component: Title,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'La balise HTML à utiliser pour le titre',
    },
    className: { control: 'text', description: 'Classes CSS additionnelles' },
  },
}

export default meta
type Story = StoryObj<typeof Title>

export const Default: Story = {
  args: {
    children: 'Ceci est un titre',
  },
}

export const WithSubtitle: Story = {
  args: {
    children: 'Titre avec un sous-titre',
  },
}

export const AsH2: Story = {
  args: {
    children: 'Titre de niveau 2',
    tag: 'h2',
  },
}

export const WithChildren: Story = {
  args: {
    children: (
      <span>
        Titre via la prop <em>children</em>
      </span>
    ),
  },
}

export const CustomClass: Story = {
  args: {
    children: 'Titre avec style personnalisé',
    className: 'text-blue-600 italic',
  },
}
