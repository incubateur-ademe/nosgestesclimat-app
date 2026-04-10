// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Card from './Card'

const meta: Meta<typeof Card> = {
  title: 'Design System/Layout/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'select',
      options: ['div', 'article', 'section', 'a'],
      description: 'HTML tag to render the card as',
    },
    href: {
      control: 'text',
      description: 'URL for link variant',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for interactive cards',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold">Titre de la carte</h3>
        <p className="text-gray-600">
          Contenu de la carte avec du texte descriptif.
        </p>
      </div>
    ),
  },
}

export const AsLink: Story = {
  args: {
    tag: 'a',
    href: '/example',
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold">Carte cliquable</h3>
        <p className="text-gray-600">
          Cette carte est un lien et peut être cliquée.
        </p>
      </div>
    ),
  },
}

export const WithClickHandler: Story = {
  args: {
    onClick: () => console.log('Card clicked'),
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold">Carte interactive</h3>
        <p className="text-gray-600">Cette carte a un gestionnaire de clic.</p>
      </div>
    ),
  },
}

export const CustomStyling: Story = {
  args: {
    className: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold text-blue-800">Carte stylisée</h3>
        <p className="text-blue-600">Cette carte a des styles personnalisés.</p>
      </div>
    ),
  },
}

export const AsArticle: Story = {
  args: {
    tag: 'article',
    children: (
      <div>
        <h3 className="mb-2 text-lg font-bold">Article</h3>
        <p className="text-gray-600">
          Cette carte est rendue comme un élément article.
        </p>
      </div>
    ),
  },
}

export const WithImage: Story = {
  args: {
    children: (
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://via.placeholder.com/300x200"
          alt="Placeholder"
          className="mb-4 w-full rounded-lg"
        />
        <h3 className="mb-2 text-lg font-bold">Carte avec image</h3>
        <p className="text-gray-600">Cette carte contient une image.</p>
      </div>
    ),
  },
}
