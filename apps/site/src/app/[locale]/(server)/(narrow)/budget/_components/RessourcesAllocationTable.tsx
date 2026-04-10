import { useLocale } from '@/hooks/useLocale'

const arraySum = (arr: number[]) =>
  arr.reduce((a, b) => (!isNaN(b) ? a + b : a), 0)

const formatValue = (value: number, locale: Intl.LocalesArgument) =>
  !isNaN(value) ? value.toLocaleString(locale) : '-'

interface Props {
  selectedYear: string
  budget: Record<string, Record<string, Record<string, number>>>
  products: string[]
  categories: string[]
}

export default function RessourcesAllocationTable({
  selectedYear,
  categories,
  products,
  budget,
}: Props) {
  const locale = useLocale()
  return (
    <div className="overflow-auto">
      <table className="mb-8 w-full text-left">
        <thead className="font-bold">
          <tr>
            <td className="w-[6rem] p-2">{selectedYear}</td>
            <td className="w-[6rem] p-2 text-right">Total</td>
          </tr>
        </thead>
        <tbody className="bg-primary-200">
          {categories.map((label: string) => (
            <tr key={label}>
              <td className="w-[6rem] p-2">{label}</td>
              <td className="w-[6rem] p-2 text-right font-bold">
                {formatValue(
                  arraySum(
                    products.map((q) => budget[selectedYear]?.[q]?.[label] ?? 0)
                  ),
                  locale
                )}{' '}
                €
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-primary-700">
            <td className="w-[6rem] p-2 font-bold text-white">Total TTC</td>
            <td className="w-[6rem] p-2 text-right font-bold text-white">
              {formatValue(
                arraySum(
                  products.map((q) =>
                    arraySum(Object.values(budget[selectedYear]?.[q] ?? {}))
                  )
                ),
                locale
              )}{' '}
              €
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
