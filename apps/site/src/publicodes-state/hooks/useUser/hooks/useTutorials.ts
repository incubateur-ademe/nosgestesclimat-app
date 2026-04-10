import type { Dispatch, SetStateAction } from 'react'
import type { Tutorials } from '../../../types'
interface Props {
  setTutorials: Dispatch<SetStateAction<Tutorials>>
}

export default function useTutorials({ setTutorials }: Props) {
  const hideTutorial = (tutorial: string) =>
    setTutorials((prevTutorials: Tutorials) => ({
      ...prevTutorials,
      [tutorial]: true,
    }))

  const showTutorial = (tutorial: string) =>
    setTutorials((prevTutorials: Tutorials) => ({
      ...prevTutorials,
      [tutorial]: false,
    }))

  return { hideTutorial, showTutorial }
}
