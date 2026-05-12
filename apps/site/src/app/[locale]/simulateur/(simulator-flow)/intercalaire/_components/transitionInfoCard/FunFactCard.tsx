export default function FunFactCard({ children }: React.PropsWithChildren) {
  return (
    <div className="flex w-80 max-w-full -rotate-6 flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  )
}
