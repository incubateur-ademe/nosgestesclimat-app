import type { Matches } from '../_components/SearchBar'

export default function highlightMatches(str: string, matches: Matches) {
  if (!matches?.length) {
    return str
  }
  const indices = matches[0].indices
    .sort(([a], [b]) => a - b)
    .map(([x, y]) => [x, y + 1])
    .reduce(
      (acc, value) =>
        acc[acc.length - 1][1] <= value[0] ? [...acc, value] : acc,
      [[0, 0]]
    )
    .flat()
  return [...indices, str.length].reduce(
    ([highlight, prevIndice, acc], currentIndice, i) => {
      const currentStr = str.slice(prevIndice, currentIndice)

      return [
        !highlight,
        currentIndice,
        [
          ...acc,
          <span className={highlight ? 'bg-primary-100 font-bold' : ''} key={i}>
            {currentStr}
          </span>,
        ],
      ] as [boolean, number, React.ReactNode[]]
    },
    [false, 0, []] as [boolean, number, React.ReactNode[]]
  )[2]
}
