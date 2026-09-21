import WhatsappIcon from '@/components/icons/share/WhatsappIcon'
import { t } from '@/helpers/metadata/fakeMetadataT'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Share from '../Share'

const DUMMY_SHARE_URL = 'http://testing-rules.fr'

const DUMMY_WHATSAPP_LINK = 'https://api.whatsapp.com/send?text='

const DUMMY_COMPLETE_URL = `${DUMMY_WHATSAPP_LINK}${DUMMY_SHARE_URL}`

const mockProps = {
  buttonLabel: t('Partager'),
  shareItems: [
    {
      label: t('Whatsapp'),
      link: DUMMY_COMPLETE_URL,
      icon: <WhatsappIcon />,
    },
  ],
  modalTitle: t('Partager le simulateur'),
  modalDescription: t(
    'Envoyez le simulateur à vos proches et faites votre 1ère bonne action !'
  ),
  linkShared: DUMMY_SHARE_URL,
}

describe('Share component', () => {
  it('should display a share button', () => {
    // Given
    render(<Share {...mockProps} />)

    // Then
    expect(screen.getByTestId('share-button')).toBeInTheDocument()
  })

  it('should display a modal window upon click on the share button', async () => {
    // Given
    render(<Share {...mockProps} />)

    // When
    await userEvent.click(screen.getByTestId('share-button'))

    // Then
    expect(screen.getByTestId('modal-element')).toBeInTheDocument()
  })

  it('should share the shared url to network page', async () => {
    // Given
    render(<Share {...mockProps} />)

    // When
    await userEvent.click(screen.getByTestId('share-button'))

    // Then
    const firstShareLink = screen.getByTestId('share-button-link-0')
    expect(firstShareLink).toHaveAttribute('href', DUMMY_COMPLETE_URL)
    expect(firstShareLink).toHaveAttribute('target', '_blank')
  })
})
