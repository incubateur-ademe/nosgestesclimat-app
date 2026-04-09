import FinTabs from '@/app/[locale]/(server)/(large)/fin/_components/FinTabs'

export default function Layout({ children }: LayoutProps<'/[locale]/fin'>) {
  return (
    <div data-track>
      <FinTabs />
      {children}
    </div>
  )
}
