// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { http, HttpResponse } from 'msw'
import AllBlogCategories from './AllBlogCategories'

// Mock data for categories
const mockCategories = [
  { id: '1', title: 'Écologie', slug: 'ecologie' },
  { id: '2', title: 'Énergie', slug: 'energie' },
  { id: '3', title: 'Transport', slug: 'transport' },
]

const meta: Meta<typeof AllBlogCategories> = {
  title: 'Design System/CMS/AllBlogCategories',
  component: AllBlogCategories,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        // This handler is for the preflight "OPTIONS" request that the browser sends
        http.options('https://cms.nosgestesclimat.fr/api/categories*', () => {
          return new HttpResponse(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Authorization, cache',
            },
          })
        }),
        // This handler is for the actual "GET" request
        http.get('https://cms.nosgestesclimat.fr/api/categories*', () => {
          return HttpResponse.json({ data: mockCategories })
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    locale: {
      control: 'select',
      options: ['fr', 'en'],
      description: 'Locale for translations',
    },
  },
}

export default meta
type Story = StoryObj<typeof AllBlogCategories>

const Template: Story = {
  loaders: [
    async ({ args }: { args: any }) => ({
      component: await AllBlogCategories(args),
    }),
  ],
  render: (args: any, { loaded }: { loaded: any }) => loaded.component,
}

export const Default: Story = {
  ...Template,
  args: {
    locale: 'fr',
  },
}

export const English: Story = {
  ...Template,
  args: {
    locale: 'en',
  },
}

export const WithCustomStyling: Story = {
  ...Template,
  args: {
    locale: 'fr',
    className: 'bg-gray-100',
  },
}
