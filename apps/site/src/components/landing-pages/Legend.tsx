export default function Legend({ htmlLegend }: { htmlLegend: string }) {
  return (
    <div className="mx-auto flex w-full max-w-screen justify-center px-2 pt-18 pb-12 md:max-w-5xl md:px-0">
      <div
        className="markdown mt-12 text-sm"
        dangerouslySetInnerHTML={{ __html: htmlLegend }}
      />
    </div>
  )
}
