import type { Situation } from '@/publicodes-state/types'
import type { Situation as PublicodesSituation } from 'publicodes'

// It shoudnlt be a situation type as it is a formatted situation from DB.
export function unformatSituation(
  situation?: PublicodesSituation<string>
): Situation {
  return Object.entries({ ...situation }).reduce(
    (acc: Situation, [key, value]) => {
      // Key is not formatted
      if (!key.includes('_')) {
        acc[key as keyof Situation] = value
        return acc
      }

      let unformattedKey = key.replaceAll('_', ' . ').replaceAll('-', ' ')

      const wordsToHardcode = {
        't shirt': 't-shirt',
        'sèche linge': 'sèche-linge',
        'lave linge': 'lave-linge',
        'lave vaisselle': 'lave-vaisselle',
        'micro onde': 'micro-onde',
        'éco construit': 'éco-construit',
      }

      for (const [keyToHardcode, valueToHardcode] of Object.entries(
        wordsToHardcode
      )) {
        if (unformattedKey.includes(keyToHardcode)) {
          unformattedKey = unformattedKey.replace(
            keyToHardcode,
            valueToHardcode
          )
        }
      }

      acc[unformattedKey as keyof Situation] = value

      return acc
    },
    {} as Situation
  )
}
