import type { Post } from '@/types/posts'
import fs from 'fs/promises'
import matter from 'gray-matter'
import path from 'path'

// Posts are .mdx files bundled with the deployment: they cannot change at
// runtime, so each folder is only read from disk once per server process.
const postsByFolder = new Map<string, Promise<Post[]>>()

export function getPosts(folderPath: string): Promise<Post[]> {
  const cached = postsByFolder.get(folderPath)
  if (cached) {
    return cached
  }

  const posts = readPosts(folderPath)
  postsByFolder.set(folderPath, posts)
  // Don't cache a transient failure (e.g. EMFILE) for the process lifetime.
  posts.catch(() => postsByFolder.delete(folderPath))
  return posts
}

async function readPosts(folderPath: string): Promise<Post[]> {
  const realFolderPath = path.join(process.cwd(), folderPath)
  const files = await fs.readdir(realFolderPath)
  return await Promise.all(
    files.map(async (file) => {
      const source = await fs.readFile(path.join(realFolderPath, file), 'utf-8')
      const matterResult = matter(source)
      return {
        slug: file.replace('.mdx', ''),
        data: matterResult.data,
        content: matterResult.content,
      }
    })
  )
}
