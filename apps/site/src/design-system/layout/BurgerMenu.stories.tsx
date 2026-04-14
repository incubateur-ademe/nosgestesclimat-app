import Link from '@/components/Link'
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import BurgerMenu from './BurgerMenu'

const meta: Meta<typeof BurgerMenu> = {
  title: 'Design System/Layout/BurgerMenu',
  component: BurgerMenu,
  parameters: {
    layout: 'fullscreen', // Fullscreen to allow the menu to overlay
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof BurgerMenu>

const MenuContent = ({ closeMenu }: { closeMenu: () => void }) => (
  <ul>
    <li>
      <Link href="#" onClick={closeMenu} className="block p-4">
        Accueil
      </Link>
    </li>
    <li>
      <Link href="#" onClick={closeMenu} className="block p-4">
        À propos
      </Link>
    </li>
    <li>
      <Link href="#" onClick={closeMenu} className="block p-4">
        Contact
      </Link>
    </li>
  </ul>
)

export const Default: Story = {
  args: {
    children: ({ closeMenu }) => <MenuContent closeMenu={closeMenu} />,
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen w-full bg-gray-100">
        <div className="absolute top-4 left-4">
          Contenu de la page derrière le menu.
        </div>
        <Story />
      </div>
    ),
  ],
}
