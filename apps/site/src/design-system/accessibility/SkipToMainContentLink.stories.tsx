// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import SkipToMainContentLink from './SkipToMainContentLink'

const meta: Meta<typeof SkipToMainContentLink> = {
  title: 'Design System/Accessibility/SkipToMainContentLink',
  component: SkipToMainContentLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen">
        <Story />
        <div id="main-content" className="mt-8 border border-gray-300 p-4">
          <h1>Main Content Area</h1>
          <p>
            This is the main content that would be focused when clicking
            "Contenu".
          </p>
          <button className="text-blue-600 underline">
            First focusable element
          </button>
        </div>
        <nav id="nav-menu" className="mt-4 border border-gray-300 p-4">
          <button id="nav-first-link" className="text-blue-600 underline">
            Navigation link
          </button>
        </nav>
        <footer id="footer" className="mt-4 border border-gray-300 p-4">
          <button className="text-blue-600 underline">Footer link</button>
        </footer>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SkipToMainContentLink>

export const Default: Story = {
  args: {},
}
