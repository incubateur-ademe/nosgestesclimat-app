// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import Button from '../buttons/Button'
import Modal from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Design System/Modals/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

const ModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      <Button onClick={openModal}>Ouvrir la modale</Button>
      <Modal
        {...args}
        ariaLabel="Modale storybook"
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </>
  )
}

type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    children: (
      <div>
        <h2>Contenu de la modale</h2>
        <p>
          Ceci est le contenu qui apparaît à l'intérieur de la boîte de dialogue
          modale. Vous pouvez y placer n'importe quel élément React.
        </p>
      </div>
    ),
  },
}

export const WithCustomButtons: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    ...Default.args,
    hasAbortButton: false, // On cache le bouton "Annuler" par défaut
    buttons: (
      <div className="flex gap-2">
        <Button color="secondary">Action secondaire</Button>
        <Button>Action principale</Button>
      </div>
    ),
  },
}

export const WithoutAbortCross: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    ...Default.args,
    hasAbortCross: false,
  },
}

export const LoadingState: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    ...Default.args,
    isLoading: true,
  },
}
