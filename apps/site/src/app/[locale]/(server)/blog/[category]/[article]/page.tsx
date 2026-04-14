import Trans from '@/components/translation/trans/TransServer'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { fetchArticlePageContent } from '@/services/cms/fetchArticlePageContent'
import { fetchArticlePageMetadata } from '@/services/cms/fetchArticlePageMetadata'

import Footer from '@/components/layout/Footer'
import Badge from '@/design-system/layout/Badge'
import { getShouldBeLocalised } from '@/helpers/language/getShouldBeLocalised'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import ArticleBreadcrumbs from './_components/ArticleBreadcrumbs'
import ArticleDate from './_components/ArticleDate'
import ArticleJSONLD from './_components/ArticleJSONLD'
import AuthorBlock from './_components/AuthorBlock'
import OtherArticles from './_components/OtherArticles'
import StickySidebar from './_components/StickySidebar'

export async function generateMetadata({
  params,
}: DefaultPageProps<{
  params: { category: string; article: string; locale: Locale }
}>) {
  const { category, article, locale } = await params

  const { metaTitle, metaDescription, image } =
    (await fetchArticlePageMetadata({
      articleSlug: article,
      locale: locale,
    })) ?? {}

  return getMetadataObject({
    locale,
    title: metaTitle ?? 'Blog - Nos Gestes Climat',
    description:
      metaDescription ??
      'Découvrez des conseils pratiques pour réduire votre empreinte écologique.',
    image: image?.url ?? '',
    alternates: {
      canonical: `/blog/${category}/${article}`,
    },
    locales: (await getShouldBeLocalised({ category, article }))
      ? [...i18nConfig.locales]
      : [i18nConfig.defaultLocale],
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; article: string; locale: Locale }>
}) {
  const { category, article: articleSlug, locale } = await params

  const { article, otherArticles } =
    (await fetchArticlePageContent({
      articleSlug: articleSlug,
      categorySlug: category,
      locale,
    })) ?? {}

  //  Firstly redirect to french version if the page is not available in the current locale
  if (locale !== i18nConfig.defaultLocale && !article) {
    return redirect(`/fr/blog/${category}/${articleSlug}`)
  }

  //  If the page is not available in the default locale, redirect to the not found page
  if (locale === i18nConfig.defaultLocale && !article) {
    notFound()
  }

  if (!article) {
    notFound()
  }

  return (
    <>
      <ArticleJSONLD
        article={article}
        articleTitle={article.title}
        articleSlug={articleSlug}
        categorySlug={category}
        categoryTitle={article.blogCategory?.title ?? ''}
      />

      <div className="relative max-w-5xl px-4 md:mx-auto lg:px-0">
        <ArticleBreadcrumbs
          categorySlug={category}
          articleSlug={articleSlug}
          articleTitle={article.title}
          categoryTitle={article.blogCategory?.title ?? ''}
        />

        <div className="mb-16 flex flex-col items-start gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-start md:w-8/12">
            <div className="flex flex-col items-start">
              <h1 className="order-1 mb-6 text-3xl font-bold md:text-5xl">
                {article.title}
              </h1>
              <Badge className="-order-1 mb-4" size="sm">
                {article.blogCategory?.title ?? ''}
              </Badge>
            </div>

            <div className="flex flex-col flex-wrap gap-1">
              <p className="mb-0">
                <span className="text-primary-600">
                  <Trans locale={locale}>Temps de lecture :</Trans>
                </span>{' '}
                {Math.round(article.duration / 60)}{' '}
                <Trans locale={locale}>minutes</Trans>
              </p>

              <ArticleDate article={article} locale={locale} />
            </div>
          </div>

          <div className="md:w-4/12">
            <Image
              className="rounded-md"
              src={article.image?.url ?? ''}
              alt={article.image?.alternativeText ?? ''}
              width={420}
              height={420}
            />
          </div>
        </div>

        <StickySidebar
          article={article}
          category={category}
          articleSlug={articleSlug}
        />

        <div className="relative mt-8 flex max-w-5xl flex-col flex-nowrap gap-8 overflow-visible md:mx-auto md:mt-0 md:flex-row md:items-stretch">
          <div className="max-w-full md:w-8/12">
            <div
              className="markdown max-w-full border-b border-gray-300 pb-8"
              dangerouslySetInnerHTML={{ __html: article.htmlContent ?? '' }}
            />
          </div>
        </div>
      </div>

      <AuthorBlock locale={locale} author={article.author} />

      <OtherArticles articles={otherArticles} locale={locale} />

      <Footer
        backgroundColor="white"
        locale={locale}
        params={{ category, article: articleSlug }}
      />
    </>
  )
}
