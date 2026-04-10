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
    title: { control: 'text', description: 'Le titre principal' },
    subtitle: { control: 'text', description: 'Le sous-titre' },
    tag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'La balise HTML à utiliser pour le titre',
    },
    hasSeparator: {
      control: 'boolean',
      description: 'Afficher un séparateur sous le titre',
    },
    className: { control: 'text', description: 'Classes CSS additionnelles' },
  },
}

export default meta
type Story = StoryObj<typeof Title>

export const Default: Story = {
  args: {
    title: 'Ceci est un titre',
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Titre avec un sous-titre',
    subtitle: 'Un sous-titre pour donner plus de contexte.',
  },
}

export const AsH2: Story = {
  args: {
    title: 'Titre de niveau 2',
    tag: 'h2',
  },
}

export const WithoutSeparator: Story = {
  args: {
    title: 'Titre sans séparateur',
    hasSeparator: false,
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
    title: 'Titre avec style personnalisé',
    className: 'text-blue-600 italic',
  },
}
