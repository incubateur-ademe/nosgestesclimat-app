interface Props {
  value: string
  text: React.ReactNode
}

export default function EventNumber({ value, text }: Props) {
  return (
    <div className="text-center text-white">
      <span className="block">{value}</span>

      <span className="block text-center uppercase">{text}</span>
    </div>
  )
}
