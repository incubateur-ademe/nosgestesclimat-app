import MDXContent from '@/components/mdx/MDXContent'
import { default as content } from './content.mdx'

export default function LegalMentionsBaseEmpreinte() {
  return <MDXContent locale="fr" contentFr={content} />
}
