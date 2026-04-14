import Button from '@/design-system/buttons/Button'

interface Props {
  onClick: () => void
  color?: 'white' | 'primary'
  title?: string
  className?: string
}

export default function QuestionButton({ onClick, title }: Props) {
  return (
    <Button
      onClick={onClick}
      title={title}
      color={'text'}
      size="xs"
      className="z-10 h-6 w-6 p-0 font-normal">
      (?)
    </Button>
  )
}
