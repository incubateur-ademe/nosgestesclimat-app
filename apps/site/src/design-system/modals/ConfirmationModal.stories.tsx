// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import ConfirmationModal from './ConfirmationModal'

const meta: Meta<typeof ConfirmationModal> = {
  title: 'Design System/Modals/ConfirmationModal',
  component: ConfirmationModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onConfirm: {
      action: 'confirmed',
      description: 'Handler for confirmation action',
    },
    closeModal: {
      action: 'closed',
      description: 'Handler for closing the modal',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the modal is in loading state',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmationModal>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h2 className="mb-4 text-xl font-bold">Confirmer l'action</h2>
        <p>Êtes-vous sûr de vouloir effectuer cette action ?</p>
      </div>
    ),
  },
}

export const WithLongContent: Story = {
  args: {
    children: (
      <div>
        <h2 className="mb-4 text-xl font-bold">Supprimer le compte</h2>
        <p className="mb-4">
          Cette action est irréversible. Toutes vos données seront
          définitivement supprimées.
        </p>
        <p className="text-sm text-gray-600">
          Si vous changez d'avis, vous devrez créer un nouveau compte.
        </p>
      </div>
    ),
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    children: (
      <div>
        <h2 className="mb-4 text-xl font-bold">Traitement en cours</h2>
        <p>Veuillez patienter pendant que nous traitons votre demande...</p>
      </div>
    ),
  },
}

export const SimpleMessage: Story = {
  args: {
    children: (
      <div>
        <h2 className="mb-4 text-xl font-bold">Action simple</h2>
        <p>Confirmez-vous cette action ?</p>
      </div>
    ),
  },
}
