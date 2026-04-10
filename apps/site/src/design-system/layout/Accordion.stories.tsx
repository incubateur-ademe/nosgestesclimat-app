// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Accordion from './Accordion'
import AccordionItem from './accordion/AccordionItem'

const meta: Meta<typeof Accordion> = {
  title: 'Design System/Layout/Accordion',
  component: Accordion,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  args: {
    children: (
      <>
        <AccordionItem
          name="item1"
          title="Premier élément"
          content="Contenu du premier élément."
        />
        <AccordionItem
          name="item2"
          title="Deuxième élément"
          content="Contenu du deuxième élément."
        />
        <AccordionItem
          name="item3"
          title="Troisième élément"
          content="Contenu du troisième élément."
        />
      </>
    ),
  },
}

export const WithCustomClass: Story = {
  args: {
    className: 'border-2 border-dashed border-gray-300 p-4 rounded-lg',
    children: (
      <>
        <AccordionItem
          name="item1"
          title="Élément dans un conteneur stylisé"
          content="Ce contenu est dans un accordéon avec une classe personnalisée."
        />
      </>
    ),
  },
}

export const SingleItem: Story = {
  args: {
    children: (
      <AccordionItem
        name="single"
        title="Un seul élément"
        content="Contenu de l'unique élément."
      />
    ),
  },
}
