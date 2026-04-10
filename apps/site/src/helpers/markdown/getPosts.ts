import type { Post } from '@/types/posts'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

export function getPosts(folderPath: string): Post[] {
  const realFolderPath = path.join(process.cwd(), folderPath)
  const files = fs.readdirSync(realFolderPath)
  return files.map((file) => {
    const source = fs.readFileSync(realFolderPath + file, 'utf-8')
    const matterResult = matter(source)
    return {
      slug: file.replace('.mdx', ''),
      data: matterResult.data,
      content: matterResult.content,
    }
  })
}
