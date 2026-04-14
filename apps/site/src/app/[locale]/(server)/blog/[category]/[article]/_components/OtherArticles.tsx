import type { ArticleType } from '@/adapters/cmsClient'
import Trans from '@/components/translation/trans/TransServer'
import PostThumbnail from '@/design-system/cms/PostThumbnail'

export default function OtherArticles({
  articles,
  locale,
}: {
  articles: ArticleType[] | undefined
  locale: string
}) {
  if (!articles || articles.length === 0) return null

  return (
    <div className="mt-10 bg-gray-100 px-4 pt-8 pb-12">
      <div className="max-w-5xl md:mx-auto">
        <h2 className="relative mb-8">
          <Trans locale={locale}>D'autres articles sur le même sujet</Trans>
        </h2>

        <ul className="relative flex flex-col gap-4 md:grid md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <PostThumbnail
                title={article.title}
                imageSrc={article.image?.url ?? ''}
                href={`/blog/${article.blogCategory?.slug}/${article.slug}`}
                trackingEvent={['blog', 'other-articles']}
                category={article.blogCategory?.title ?? ''}
                className="bg-white"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
