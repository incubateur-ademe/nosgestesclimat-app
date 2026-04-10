// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import PostThumbnail from './PostThumbnail'

const meta: Meta<typeof PostThumbnail> = {
  title: 'Design System/CMS/PostThumbnail',
  component: PostThumbnail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the post',
    },
    category: {
      control: 'text',
      description: 'Category of the post',
    },
    imageSrc: {
      control: 'text',
      description: 'Source URL of the thumbnail image',
    },
    href: {
      control: 'text',
      description: 'Link URL for the post',
    },
    trackingEvent: {
      control: 'object',
      description: 'Analytics tracking event array',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof PostThumbnail>

export const Default: Story = {
  args: {
    title: 'Comment réduire son empreinte carbone au quotidien',
    category: 'Écologie',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    href: '/blog/article-1',
    trackingEvent: ['blog', 'click', 'article-1'],
  },
}

export const LongTitle: Story = {
  args: {
    title:
      "Un titre très long qui pourrait déborder sur plusieurs lignes pour tester l'affichage",
    category: 'Développement durable',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    href: '/blog/article-2',
    trackingEvent: ['blog', 'click', 'article-2'],
  },
}

export const ShortTitle: Story = {
  args: {
    title: 'Titre court',
    category: 'Technologie',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    href: '/blog/article-3',
    trackingEvent: ['blog', 'click', 'article-3'],
  },
}

export const WithoutTracking: Story = {
  args: {
    title: 'Article sans tracking',
    category: 'Innovation',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    href: '/blog/article-4',
    trackingEvent: [],
  },
}

export const CustomStyling: Story = {
  args: {
    title: 'Article avec style personnalisé',
    category: 'Économie',
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    href: '/blog/article-5',
    trackingEvent: ['blog', 'click', 'article-5'],
    className: 'border-2 border-blue-500',
  },
}
