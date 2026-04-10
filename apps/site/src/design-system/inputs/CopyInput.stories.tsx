// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import CopyInput from './CopyInput'

const meta: Meta<typeof CopyInput> = {
  title: 'Design System/Inputs/CopyInput',
  component: CopyInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    textToCopy: {
      control: 'text',
      description: 'Text to copy to clipboard',
    },
    textToDisplay: {
      control: 'text',
      description:
        'Text to display in the input (if different from textToCopy)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the copy button',
    },
    canShare: {
      control: 'boolean',
      description: 'Whether to enable native sharing',
    },
  },
}

export default meta
type Story = StoryObj<typeof CopyInput>

export const Default: Story = {
  args: {
    textToCopy: 'https://nosgestesclimat.fr/simulation',
  },
}

export const WithDisplayText: Story = {
  args: {
    textToCopy:
      'https://nosgestesclimat.fr/simulation/resultats?theme=transport&region=france&mode=detaille',
    textToDisplay: 'Lien vers mes résultats...',
  },
}

export const LongText: Story = {
  args: {
    textToCopy:
      'https://nosgestesclimat.fr/simulation/resultats?theme=transport&region=france&mode=detaille&parametres=complexes&avec=beaucoup&de=parametres&pour=tester&le=comportement&du=composant',
  },
}

export const WithCustomStyling: Story = {
  args: {
    textToCopy: 'https://nosgestesclimat.fr/simulation',
    className: 'max-w-md',
  },
}

export const WithShareEnabled: Story = {
  args: {
    textToCopy: 'https://nosgestesclimat.fr/simulation',
    canShare: true,
  },
}

export const ShortText: Story = {
  args: {
    textToCopy: 'https://example.com',
  },
}

export const WithCallback: Story = {
  args: {
    textToCopy: 'https://nosgestesclimat.fr/simulation',
    onClick: () => console.log('Copy button clicked'),
  },
}
