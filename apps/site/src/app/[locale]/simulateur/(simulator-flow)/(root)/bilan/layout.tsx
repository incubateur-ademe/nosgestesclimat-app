import SimulateurLayout from './_components/SimulateurLayout'

export default function Layout({
  children,
}: LayoutProps<'/[locale]/simulateur/bilan'>) {
  return <SimulateurLayout>{children}</SimulateurLayout>
}
