import Link from '@/components/Link'
import Button from '@/design-system/buttons/Button'
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import DropdownMenu, {
  getDropdownMenuItemPosition,
} from './DropdownMenu'

const meta: Meta<typeof DropdownMenu> = {
  title: 'Design System/Layout/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DropdownMenu>

const menuItems = [
  { id: 'fr', label: 'Français', isActive: true },
  { id: 'en', label: 'English', isActive: false },
]

export const Default: Story = {
  render: () => (
    <DropdownMenu
      trigger={({ isOpen, buttonRef, buttonId, panelId, onToggle }) => (
        <Button
          ref={buttonRef}
          id={buttonId}
          size="sm"
          color="primary"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? 'Fermer le panneau' : 'Ouvrir le panneau'}
          onClick={onToggle}>
          Langue
        </Button>
      )}>
      {({ closeMenu, getItemClassName }) =>
        menuItems.map((item, index) => (
          <li key={item.id}>
            <Link
              href="#"
              aria-current={item.isActive ? 'true' : undefined}
              onClick={closeMenu}
              className={getItemClassName({
                isActive: item.isActive,
                position: getDropdownMenuItemPosition(index, menuItems.length),
              })}>
              {item.label}
            </Link>
          </li>
        ))
      }
    </DropdownMenu>
  ),
}

export const AlignedLeft: Story = {
  render: () => (
    <DropdownMenu
      align="left"
      trigger={({ isOpen, buttonRef, buttonId, panelId, onToggle }) => (
        <Button
          ref={buttonRef}
          id={buttonId}
          size="sm"
          color="secondary"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label="Actions"
          onClick={onToggle}>
          Actions
        </Button>
      )}>
      {({ closeMenu, getItemClassName }) =>
        ['Profil', 'Paramètres', 'Déconnexion'].map((label, index, items) => (
          <li key={label}>
            <Link
              href="#"
              onClick={closeMenu}
              className={getItemClassName({
                position: getDropdownMenuItemPosition(index, items.length),
              })}>
              {label}
            </Link>
          </li>
        ))
      }
    </DropdownMenu>
  ),
}
