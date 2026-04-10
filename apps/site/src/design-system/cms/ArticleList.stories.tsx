// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ArticleList from './ArticleList'

// Mock data for stories
const mockArticles = [
  {
    id: '1',
    documentId: '1',
    title: 'Comment réduire son empreinte carbone au quotidien',
    description:
      'Découvrez des gestes simples pour réduire votre impact environnemental',
    slug: 'reduire-empreinte-carbone',
    category: {
      id: 'cat1',
      documentId: 'cat1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      publishedAt: '2023-01-01',
      slug: 'ecologie',
      title: 'Écologie',
      description: "Articles sur l'écologie",
      faqDescription: 'FAQ écologie',
      additionalContent: '',
      htmlContent: '',
      htmlTitle: 'Écologie',
    },
    image: {
      url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
      alternativeText: 'Image écologie',
    },
  },
  {
    id: '2',
    documentId: '2',
    title: 'Les énergies renouvelables en France',
    description: 'État des lieux des énergies vertes en France',
    slug: 'energies-renouvelables-france',
    category: {
      id: 'cat2',
      documentId: 'cat2',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      publishedAt: '2023-01-01',
      slug: 'energie',
      title: 'Énergie',
      description: "Articles sur l'énergie",
      faqDescription: 'FAQ énergie',
      additionalContent: '',
      htmlContent: '',
      htmlTitle: 'Énergie',
    },
    image: {
      url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
      alternativeText: 'Image énergie',
    },
  },
] as any

const queryClient = new QueryClient()

const meta: Meta<typeof ArticleList> = {
  title: 'Design System/CMS/ArticleList',
  component: ArticleList,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    pageCount: {
      control: 'number',
      description: 'Total number of pages',
    },
    currentPage: {
      control: 'number',
      description: 'Current page number',
    },
    locale: {
      control: 'select',
      options: ['fr', 'en'],
      description: 'Locale for translations',
    },
  },
}

export default meta
type Story = StoryObj<typeof ArticleList>

export const Default: Story = {
  args: {
    articles: mockArticles,
    pageCount: 1,
    currentPage: 1,
    locale: 'fr',
  },
}

export const WithPagination: Story = {
  args: {
    articles: [...mockArticles, ...mockArticles, ...mockArticles],
    pageCount: 3,
    currentPage: 1,
    locale: 'fr',
  },
}

export const English: Story = {
  args: {
    articles: mockArticles,
    pageCount: 1,
    currentPage: 1,
    locale: 'en',
  },
}

export const ManyArticles: Story = {
  args: {
    articles: [
      ...mockArticles,
      ...mockArticles,
      ...mockArticles,
      ...mockArticles,
    ],
    pageCount: 4,
    currentPage: 2,
    locale: 'fr',
  },
}
