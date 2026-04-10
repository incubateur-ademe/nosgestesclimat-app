import CountryFlag from '@/components/misc/CountryFlag'
import Card from '@/design-system/layout/Card'

interface Props {
  code: string
  shouldShowButton: boolean
  label: string
  isSelected: boolean
  updateCurrentRegion?: (code: string) => void
}

export default function CountryListItem({
  code,
  label,
  isSelected,
  updateCurrentRegion,
}: Props) {
  const isInteractive = !!updateCurrentRegion

  return (
    <Card
      tag={isInteractive ? 'button' : undefined}
      className={`text-default flex h-16 w-24 items-center justify-center gap-2 bg-white px-3 py-2 text-center text-xs shadow-none sm:h-12 sm:!w-36 sm:flex-row sm:justify-start sm:py-0 sm:text-left ${
        isSelected ? 'border-primary-800 bg-primary-100!' : ''
      }`}
      onClick={isInteractive ? () => updateCurrentRegion(code) : undefined}
      aria-pressed={isInteractive ? isSelected : undefined}
      aria-label={
        isInteractive
          ? `${label}${isSelected ? ', région sélectionnée' : ''}`
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                updateCurrentRegion(code)
              }
            }
          : undefined
      }>
      <CountryFlag code={code} />
      {label}
      {isInteractive && (
        <span className="sr-only">
          {isSelected
            ? 'Région actuellement sélectionnée'
            : 'Cliquez pour sélectionner cette région'}
        </span>
      )}
    </Card>
  )
}
