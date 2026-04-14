// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Confirmation from './Confirmation'

const meta: Meta<typeof Confirmation> = {
  title: 'Design System/Alerts/Confirmation',
  component: Confirmation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Confirmation>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="mb-4 text-lg font-bold">Confirmation</h3>
        <p>Votre action a été confirmée avec succès.</p>
      </div>
    ),
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <h3 className="text-lg font-bold">Action réussie</h3>
        </div>
        <p>Votre profil a été mis à jour correctement.</p>
      </div>
    ),
  },
}

export const LongContent: Story = {
  args: {
    children: (
      <div>
        <h3 className="mb-4 text-lg font-bold">Confirmation détaillée</h3>
        <p className="mb-2">
          Votre demande a été traitée avec succès. Vous recevrez un email de
          confirmation dans les prochaines minutes.
        </p>
        <p>
          Si vous ne recevez pas cet email, veuillez vérifier votre dossier spam
          ou nous contacter.
        </p>
      </div>
    ),
  },
}
