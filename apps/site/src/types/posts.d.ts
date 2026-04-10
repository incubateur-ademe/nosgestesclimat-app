export interface Post {
  slug?: string
  content: string
  data: {
    date?: string
    title?: string
    description?: string
    image?: string
    author?: string
    categories?: string
  }
}
