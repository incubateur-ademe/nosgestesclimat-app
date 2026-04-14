// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Markdown from './Markdown'

const meta: Meta<typeof Markdown> = {
  title: 'Design System/Utils/Markdown',
  component: Markdown,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Contenu Markdown à afficher',
    },
  },
}

export default meta
type Story = StoryObj<typeof Markdown>

const markdownContent = `
# Titre de niveau 1
## Titre de niveau 2
### Titre de niveau 3

Ceci est un paragraphe de texte normal. Il peut contenir du texte **en gras** et *en italique*.

> Ceci est une citation.

- Liste à puces 1
- Liste à puces 2
  - Sous-élément

1. Liste numérotée 1
2. Liste numérotée 2

[Ceci est un lien vers Nos Gestes Climat](https://nosgestesclimat.fr).

---

Un tableau :

| En-tête 1 | En-tête 2 |
| --------- | --------- |
| Cellule 1 | Cellule 2 |
| Cellule 3 | Cellule 4 |

`
export const Default: Story = {
  args: {
    children: markdownContent,
  },
}

export const WithCustomComponent: Story = {
  args: {
    children: `
Ceci est un texte normal.

<button href="#">Ceci est un bouton</button>

`,
  },
}
