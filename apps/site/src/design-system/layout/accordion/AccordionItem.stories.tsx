// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Accordion from '../Accordion'
import AccordionItem from './AccordionItem'

const meta: Meta<typeof AccordionItem> = {
  title: 'Design System/Layout/Accordion/AccordionItem',
  component: AccordionItem,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Accordion>
        <Story />
      </Accordion>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    name: { control: 'text' },
    content: { control: 'text' },
    isReadOnly: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof AccordionItem>

export const Default: Story = {
  args: {
    name: 'item1',
    title: "Titre de l'élément",
    content: 'Contenu qui apparaît au dépliage.',
  },
}

export const ReadOnly: Story = {
  args: {
    name: 'item2',
    title: 'Élément en lecture seule',
    content: 'Ce contenu est visible mais non interagible.',
    isReadOnly: true,
  },
}

export const WithRichContent: Story = {
  args: {
    name: 'item3',
    title: 'Titre avec contenu riche',
    content: (
      <div>
        <h4>Sous-titre</h4>
        <p>
          Un paragraphe avec <strong>du gras</strong> et <em>de l'italique</em>.
        </p>
        <ul>
          <li>Point 1</li>
          <li>Point 2</li>
        </ul>
      </div>
    ),
  },
}

export const WithCallback: Story = {
  args: {
    name: 'item4',
    title: 'Élément avec callback',
    content: 'Le clic sur cet élément déclenche une action.',
    onClick: () => alert('AccordionItem clicked!'),
  },
}
