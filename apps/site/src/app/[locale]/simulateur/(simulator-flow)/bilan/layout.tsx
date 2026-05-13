import SimulateurLayout from './_components/SimulateurLayout'

export default function Layout({
  children,
}: LayoutProps<'/[locale]/simulateur/[root]'>) {
  return <SimulateurLayout>{children}</SimulateurLayout>
}
