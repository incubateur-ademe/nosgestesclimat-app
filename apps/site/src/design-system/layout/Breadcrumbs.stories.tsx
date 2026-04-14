// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Breadcrumbs from './Breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Design System/Layout/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: "Tableau des éléments du fil d'Ariane",
    },
    className: {
      control: 'text',
      description: 'Classes CSS pour le conteneur',
    },
    linkClassName: {
      control: 'text',
      description: 'Classes CSS pour les liens',
    },
  },
}

export default meta

type Story = StoryObj<typeof Breadcrumbs>

const defaultItems = [
  { href: '/accueil', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  {
    href: '/blog/article',
    label: "Titre de l'article actuel",
    isActive: true,
  },
]

export const Default: Story = {
  args: {
    items: defaultItems,
  },
}

export const LongPath: Story = {
  args: {
    items: [
      ...defaultItems.slice(0, 2),
      { href: '/blog/categorie', label: 'Catégorie' },
      {
        href: '/blog/categorie/sous-categorie',
        label: 'Sous-catégorie très longue qui pourrait déborder',
      },
      {
        href: '/blog/categorie/sous-categorie/article',
        label: "Titre de l'article",
        isActive: true,
      },
    ],
  },
}

export const WithDisabledLink: Story = {
  args: {
    items: [
      { href: '/accueil', label: 'Accueil' },
      { href: '/profil', label: 'Profil', isDisabled: true },
      {
        href: '/profil/edition',
        label: 'Édition',
        isActive: true,
      },
    ],
  },
}

export const CustomClass: Story = {
  args: {
    items: defaultItems,
    className: 'bg-gray-100 rounded-lg p-4',
    linkClassName: 'text-green-700',
  },
}
