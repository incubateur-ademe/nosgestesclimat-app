// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ImageWithCategory from './ImageWithCategory'

const meta: Meta<typeof ImageWithCategory> = {
  title: 'Design System/CMS/ImageWithCategory',
  component: ImageWithCategory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    imageSrc: {
      control: 'text',
      description: 'Source URL of the image',
    },
    imageAlt: {
      control: 'text',
      description: 'Alt text for the image',
    },
    width: {
      control: 'number',
      description: 'Width of the image',
    },
    height: {
      control: 'number',
      description: 'Height of the image',
    },
    imageClassName: {
      control: 'text',
      description: 'Additional CSS classes for the image',
    },
    containerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
    category: {
      control: 'text',
      description: 'Category text to display in the badge',
    },
    hideBadgeOnMobile: {
      control: 'boolean',
      description: 'Whether to hide the badge on mobile devices',
    },
  },
}

export default meta
type Story = StoryObj<typeof ImageWithCategory>

export const Default: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    imageAlt: 'Example image',
    category: 'Écologie',
  },
}

export const LargeImage: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    imageAlt: 'Large example image',
    width: 640,
    height: 480,
    category: 'Technologie',
  },
}

export const WithCustomClasses: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    imageAlt: 'Custom styled image',
    imageClassName: 'border-4 border-blue-500',
    containerClassName: 'p-4 bg-gray-100 rounded-lg',
    category: 'Innovation',
  },
}

export const BadgeAlwaysVisible: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    imageAlt: 'Image with always visible badge',
    category: 'Urgent',
    hideBadgeOnMobile: false,
  },
}

export const LongCategoryText: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    imageAlt: 'Image with long category',
    category: 'Développement durable et écologie',
  },
}
