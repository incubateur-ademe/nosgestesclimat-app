import type { Post } from '@/types/posts'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

export function getPost(folderPath: string, slug: string): Post | null {
  const filePath = path.join(process.cwd(), folderPath + slug + '.mdx')
  try {
    const source = fs.readFileSync(filePath, 'utf-8')
    const matterResult = matter(source)

    return matterResult
  } catch {
    return null
  }
}
