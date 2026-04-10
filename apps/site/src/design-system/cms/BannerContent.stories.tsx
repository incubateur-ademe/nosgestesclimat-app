// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { BannerContent } from './BannerContent'

const meta: Meta<typeof BannerContent> = {
  title: 'Design System/CMS/BannerContent',
  component: BannerContent,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    banner: {
      control: 'object',
      description: 'Banner data object',
    },
  },
}

export default meta
type Story = StoryObj<typeof BannerContent>

const mockBanner = {
  id: '1',
  documentId: '1',
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  publishedAt: '2023-01-01',
  text: "Découvrez notre nouveau simulateur d'empreinte carbone !",
  link: {
    URL: '/simulateur',
    label: 'Essayer maintenant',
  },
  startDate: '2023-01-01',
  endDate: '2024-12-31',
}

export const Default: Story = {
  args: {
    banner: mockBanner,
  },
}

export const LongText: Story = {
  args: {
    banner: {
      ...mockBanner,
      text: "Un message très long qui pourrait déborder sur plusieurs lignes pour tester l'affichage responsive de la bannière",
    },
  },
}

export const ShortText: Story = {
  args: {
    banner: {
      ...mockBanner,
      text: 'Message court',
    },
  },
}

export const WithLongLink: Story = {
  args: {
    banner: {
      ...mockBanner,
      link: {
        URL: '/blog/article-tres-long',
        label: "Lire l'article complet sur notre blog",
      },
    },
  },
}

export const NoBanner: Story = {
  args: {
    banner: null,
  },
}
