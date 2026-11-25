import PlatsCustomQuestion from './plats'
import TextileCustomQuestion from './textile'
import type { CustomQuestion } from './types'
import VoitureCustomQuestion from './voiture'

/** Ordered registry of custom questions; the first match wins. */
export const customQuestions: CustomQuestion[] = [
  PlatsCustomQuestion,
  VoitureCustomQuestion,
  TextileCustomQuestion,
]
