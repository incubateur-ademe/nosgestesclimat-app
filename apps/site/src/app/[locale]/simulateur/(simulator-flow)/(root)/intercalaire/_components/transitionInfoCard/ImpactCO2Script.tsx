interface Props {
  locale: string
  type?: string
}

export default function ImpactCO2Script({ locale, type = 'chauffage' }: Props) {
  return (
    <div
      id="impact-co2"
      data-type={type}
      data-search={`?m2=63&language=${locale}&theme=default`}
    />
  )
}
