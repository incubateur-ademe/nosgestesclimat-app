interface Props {
  value: string
  text: React.ReactNode
}

export default function EventNumber({ value, text }: Props) {
  return (
    <div className="flex-1 text-center text-white">
      <span className="block text-5xl font-bold tracking-tight md:text-6xl">
        {value}
      </span>

      <span className="block text-center text-sm font-medium uppercase">
        {text}
      </span>
    </div>
  )
}
