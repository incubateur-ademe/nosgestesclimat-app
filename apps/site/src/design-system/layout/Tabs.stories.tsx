import type { Meta, StoryObj } from '@storybook/react'
import Tabs, { type TabItem } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Layout/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    items: {
      control: false,
      description: 'Array of tab items',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA label for the navigation',
    },
    containerId: {
      control: 'text',
      description: 'ID for the container element',
    },
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

// Exemple basique avec des liens
const basicItems: TabItem[] = [
  {
    id: 'tab1',
    label: 'Premier onglet',
    href: '/premier',
    isActive: true,
  },
  {
    id: 'tab2',
    label: 'Deuxième onglet',
    href: '/deuxieme',
    isActive: false,
  },
  {
    id: 'tab3',
    label: 'Troisième onglet',
    href: '/troisieme',
    isActive: false,
  },
]

export const Basic: Story = {
  args: {
    items: basicItems,
    ariaLabel: 'Navigation principale',
  },
}

const complexItems: TabItem[] = [
  {
    id: 'complex1',
    label: (
      <span>
        📊 <strong>Statistiques</strong>
      </span>
    ),
    href: '/stats',
    isActive: true,
  },
  {
    id: 'complex2',
    label: (
      <span>
        ⚙️ <em>Paramètres</em>
      </span>
    ),
    href: '/settings',
    isActive: false,
  },
]

export const ComplexLabels: Story = {
  args: {
    items: complexItems,
    ariaLabel: 'Navigation avec labels complexes',
  },
}
