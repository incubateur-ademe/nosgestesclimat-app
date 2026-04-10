// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import Switch from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Design System/Inputs/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Switch>

export const WithLinkOptions: Story = {
  args: {
    'aria-label': "Sélecteur de type d'empreinte",
    options: [
      {
        label: 'Empreinte carbone',
        href: '/fr/simulation/123/resultats',
        isSelected: true,
      },
      {
        label: 'Empreinte eau 💧',
        href: '/fr/simulation/123/resultats/eau',
        isSelected: false,
      },
    ],
  },
}

export const WithButtonOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<number>(0)

    return (
      <Switch
        aria-label="Sélecteur de type d'empreinte"
        options={[
          {
            label: 'Empreinte carbone',
            isSelected: selected === 0,
            onClick: () => setSelected(0),
          },
          {
            label: 'Empreinte eau 💧',
            isSelected: selected === 1,
            onClick: () => setSelected(1),
          },
        ]}
      />
    )
  },
}
