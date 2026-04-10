// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Container from './Container'

const meta: Meta<typeof Container> = {
  title: 'Design System/Layout/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Classes CSS pour personnaliser le conteneur',
    },
    maxWidth: {
      control: 'text',
      description: 'Largeur maximale du conteneur (ex: "lg", "xl")',
    },
  },
}

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  args: {
    children: (
      <div className="bg-gray-200 p-4">Contenu à l'intérieur du conteneur.</div>
    ),
    className: 'p-4 bg-blue-100',
  },
}

export const WithMaxWidth: Story = {
  args: {
    children: (
      <div className="bg-gray-200 p-4">
        Ce conteneur a une largeur maximale.
      </div>
    ),
    className: 'p-4 bg-green-100',
    maxWidth: 'lg',
  },
}

export const AsSection: Story = {
  args: {
    tag: 'section',
    children: (
      <div className="bg-gray-200 p-4">
        Ce conteneur est rendu comme une balise `section`.
      </div>
    ),
    className: 'p-4 bg-yellow-100',
  },
}
