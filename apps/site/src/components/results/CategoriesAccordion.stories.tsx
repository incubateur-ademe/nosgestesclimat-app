// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'

import type { ComputedResults } from '@/publicodes-state/types'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json'

import CategoriesAccordion from './CategoriesAccordion'

const marieResults: ComputedResults = {
  carbone: {
    bilan: 4200,
    categories: {
      transport: 800,
      alimentation: 1200,
      logement: 900,
      divers: 500,
      'services sociétaux': 800,
    } as Record<DottedName, number>,
    subcategories: {
      'transport . voiture': 400,
      'transport . avion': 200,
      'transport . transports commun': 150,
      'transport . deux roues': 50,
      'alimentation . boisson': 300,
      'alimentation . déchets': 200,
      'alimentation . repas': 700,
      'logement . chauffage': 400,
      'logement . électricité': 250,
      'logement . construction': 250,
      'divers . textile': 200,
      'divers . numérique': 150,
      'divers . électroménager': 100,
      'divers . ameublement': 50,
      'services sociétaux . services publics': 500,
      'services sociétaux . services marchands': 300,
    } as Record<DottedName, number>,
  },
  eau: {
    bilan: 3500,
    categories: {
      transport: 600,
      alimentation: 1000,
      logement: 800,
      divers: 400,
      'services sociétaux': 700,
    } as Record<DottedName, number>,
  },
}

const corentinResults: ComputedResults = {
  carbone: {
    bilan: 8500,
    categories: {
      transport: 2500,
      alimentation: 2200,
      logement: 1800,
      divers: 900,
      'services sociétaux': 1100,
    } as Record<DottedName, number>,
    subcategories: {
      'transport . voiture': 1500,
      'transport . avion': 600,
      'transport . transports commun': 200,
      'transport . deux roues': 200,
      'alimentation . boisson': 500,
      'alimentation . déchets': 400,
      'alimentation . repas': 1300,
      'logement . chauffage': 900,
      'logement . électricité': 400,
      'logement . construction': 500,
      'divers . textile': 350,
      'divers . numérique': 250,
      'divers . électroménager': 200,
      'divers . ameublement': 100,
      'services sociétaux . services publics': 700,
      'services sociétaux . services marchands': 400,
    } as Record<DottedName, number>,
  },
  eau: {
    bilan: 7000,
    categories: {
      transport: 2000,
      alimentation: 1800,
      logement: 1500,
      divers: 700,
      'services sociétaux': 1000,
    } as Record<DottedName, number>,
  },
}

const gerardResults: ComputedResults = {
  carbone: {
    bilan: 14000,
    categories: {
      transport: 5000,
      alimentation: 3000,
      logement: 3200,
      divers: 1300,
      'services sociétaux': 1500,
    } as Record<DottedName, number>,
    subcategories: {
      'transport . voiture': 2500,
      'transport . avion': 2000,
      'transport . transports commun': 200,
      'transport . deux roues': 300,
      'alimentation . boisson': 600,
      'alimentation . déchets': 500,
      'alimentation . repas': 1900,
      'logement . chauffage': 1500,
      'logement . électricité': 700,
      'logement . construction': 1000,
      'divers . textile': 500,
      'divers . numérique': 350,
      'divers . électroménager': 300,
      'divers . ameublement': 150,
      'services sociétaux . services publics': 900,
      'services sociétaux . services marchands': 600,
    } as Record<DottedName, number>,
  },
  eau: {
    bilan: 12000,
    categories: {
      transport: 4000,
      alimentation: 2800,
      logement: 2700,
      divers: 1100,
      'services sociétaux': 1400,
    } as Record<DottedName, number>,
  },
}

const meta: Meta<typeof CategoriesAccordion> = {
  title: 'Components/Results/CategoriesAccordion',
  component: CategoriesAccordion,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full p-12">
        <Story />
      </div>
    ),
  ],
  args: {
    metric: 'carbone',
    locale: 'fr',
  },
  render: (args) => (
    <CategoriesAccordion {...args} rules={rules as Partial<NGCRules>} />
  ),
}

export default meta
type Story = StoryObj<typeof CategoriesAccordion>

export const FaibleEmpreinte: Story = {
  args: {
    computedResults: marieResults,
  },
}

export const MoyenneEmpreinte: Story = {
  args: {
    computedResults: corentinResults,
  },
}

export const ForteEmpreinte: Story = {
  args: {
    computedResults: gerardResults,
  },
}
