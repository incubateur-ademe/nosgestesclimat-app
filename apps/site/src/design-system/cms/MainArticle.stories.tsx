// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import MainArticle from './MainArticle'

const meta: Meta<typeof MainArticle> = {
  title: 'Design System/CMS/MainArticle',
  component: MainArticle,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    imageSrc: {
      control: 'text',
      description: 'Source URL of the main image',
    },
    title: {
      control: 'text',
      description: 'Title of the main article',
    },
    description: {
      control: 'text',
      description: 'HTML description of the article',
    },
    category: {
      control: 'text',
      description: 'Category of the article',
    },
    href: {
      control: 'text',
      description: 'Link URL for the article',
    },
    locale: {
      control: 'select',
      options: ['fr', 'en'],
      description: 'Locale for translations',
    },
  },
}

export default meta
type Story = StoryObj<typeof MainArticle>

export const Default: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    title: 'Comment réduire son empreinte carbone au quotidien',
    description:
      "<p>Découvrez des gestes simples et efficaces pour réduire votre impact environnemental. Cet article vous guide à travers les actions les plus impactantes que vous pouvez mettre en place dès aujourd'hui.</p>",
    category: 'Écologie',
    href: '/blog/ecologie/reduire-empreinte-carbone',
    locale: 'fr',
  },
}

export const LongTitle: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    title:
      "Un titre très long qui pourrait déborder sur plusieurs lignes pour tester l'affichage responsive de l'article principal",
    description:
      '<p>Description courte pour un article avec un titre très long.</p>',
    category: 'Développement durable',
    href: '/blog/developpement-durable/titre-long',
    locale: 'fr',
  },
}

export const LongDescription: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    title: 'Les énergies renouvelables en France',
    description:
      "<p>La France fait face à un défi majeur : la transition énergétique. Cet article explore les différentes sources d'énergies renouvelables disponibles dans notre pays, leur potentiel de développement et les défis à relever pour atteindre nos objectifs climatiques.</p><p>Nous analysons également les politiques publiques mises en place et les investissements nécessaires pour accélérer cette transition.</p>",
    category: 'Énergie',
    href: '/blog/energie/energies-renouvelables-france',
    locale: 'fr',
  },
}

export const English: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    title: 'How to reduce your carbon footprint daily',
    description:
      '<p>Discover simple and effective gestures to reduce your environmental impact. This article guides you through the most impactful actions you can implement starting today.</p>',
    category: 'Ecology',
    href: '/blog/ecology/reduce-carbon-footprint',
    locale: 'en',
  },
}

export const ShortContent: Story = {
  args: {
    imageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ella_olsson_KP_Db_Ry_FO_Tn_E_unsplash_9b029eb7e6.jpg',
    title: 'Titre court',
    description: '<p>Description courte.</p>',
    category: 'Innovation',
    href: '/blog/innovation/titre-court',
    locale: 'fr',
  },
}
