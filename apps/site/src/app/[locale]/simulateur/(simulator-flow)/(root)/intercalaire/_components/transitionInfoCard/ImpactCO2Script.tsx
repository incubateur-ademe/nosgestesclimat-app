interface Props {
  locale: string
}

export default function ImpactCO2Script({ locale }: Props) {
  return (
    <div
      id="impact-co2"
      data-type="chauffage"
      data-search={`?m2=63&language=${locale}&theme=default`}
    />
  )
}
