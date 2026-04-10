// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Pagination from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Design System/CMS/ArticleList/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number',
      description: 'Current page number',
    },
    totalPages: {
      control: 'number',
      description: 'Total number of pages',
    },
    locale: {
      control: 'select',
      options: ['fr', 'en'],
      description: 'Locale for translations',
    },
  },
}

export default meta

type Story = StoryObj<typeof Pagination>

const Template: Story = {
  loaders: [
    async ({ args }: { args: any }) => ({
      component: await Pagination(args),
    }),
  ],
  render: (args: any, { loaded }: { loaded: any }) => loaded.component,
}

export const Default: Story = {
  ...Template,
  args: {
    currentPage: 1,
    totalPages: 5,
    locale: 'fr',
  },
}

export const MiddlePage: Story = {
  ...Template,
  args: {
    currentPage: 3,
    totalPages: 5,
    locale: 'fr',
  },
}

export const LastPage: Story = {
  ...Template,
  args: {
    currentPage: 5,
    totalPages: 5,
    locale: 'fr',
  },
}

export const ManyPages: Story = {
  ...Template,
  args: {
    currentPage: 7,
    totalPages: 15,
    locale: 'fr',
  },
}

export const English: Story = {
  ...Template,
  args: {
    currentPage: 2,
    totalPages: 4,
    locale: 'en',
  },
}

export const SinglePage: Story = {
  ...Template,
  args: {
    currentPage: 1,
    totalPages: 1,
    locale: 'fr',
  },
}
