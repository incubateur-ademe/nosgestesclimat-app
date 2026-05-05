export default async function Page({
  params,
}: PageProps<'/[locale]/simulateur/intercalaire/alimentation'>) {
  const { locale } = await params

  return <>Alimentation</>
}
