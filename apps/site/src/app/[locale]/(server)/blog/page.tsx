import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import JSONLD from '@/components/seo/JSONLD'
import AllBlogCategories from '@/design-system/cms/AllBlogCategories'
import ArticleList from '@/design-system/cms/ArticleList'
import MainArticle from '@/design-system/cms/MainArticle'
import { getDynamicPageTitleWithPagination } from '@/helpers/blog/getDynamicPageTitleWithPagination'
import { getPageNumber } from '@/helpers/blog/getPageNumber'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import { fetchHomepageContent } from '@/services/cms/fetchHomepageContent'
import { fetchHomepageMetadata } from '@/services/cms/fetchHomepageMetadata'
import type { DefaultPageProps } from '@/types'
import { notFound } from 'next/navigation'
import BlogHero from './_components/BlogHero'

export async function generateStaticParams({
  params,
}: DefaultPageProps<{
  params: { locale: Locale }
  searchParams: { page: string }
}>) {
  const { locale } = await params
  const { pageCount } =
    (await fetchHomepageContent({
      page: 0,
      locale,
    })) ?? {}

  const locales = i18nConfig.locales
  const pages = Array.from(
    { length: pageCount ?? 3 },
    (_, index: number) => index
  )

  return locales.flatMap((locale) =>
    pages.map((page) => ({ locale, page: (page + 1).toString() }))
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: DefaultPageProps<{
  params: { locale: Locale }
  searchParams: { page: string }
}>) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  const pageNumber = await getPageNumber(searchParams)

  const { metaTitle, metaDescription, image, pageCount } =
    (await fetchHomepageMetadata({ locale, pageNumber })) || {}

  const dynamicTitle = getDynamicPageTitleWithPagination({
    metaTitle,
    pageCount,
    pageNumber,
    t,
  })

  const dynamicDefaultTitle = getDynamicPageTitleWithPagination({
    metaTitle: t(
      'blog.homepage.defaultTitle',
      'Blog, découvrez nos articles et conseils sur le climat - Nos Gestes Climat'
    ),
    pageCount,
    pageNumber,
    t,
  })

  return getMetadataObject({
    locale,
    title: dynamicTitle ?? dynamicDefaultTitle,
    description:
      metaDescription ??
      t(
        'blog.homepage.defaultDescription',
        'Découvrez des conseils pratiques pour réduire votre empreinte écologique.'
      ),
    image: image?.url ?? '',
    alternates: {
      canonical: '/blog',
    },
  })
}

export default async function BlogHomePage({
  searchParams,
  params,
}: DefaultPageProps<{
  searchParams: { page: string }
  params: { locale: Locale }
}>) {
  const { locale } = await params

  const pageNumber = await getPageNumber(searchParams)

  const { title, description, image, mainArticle, articles, pageCount } =
    (await fetchHomepageContent({
      page: pageNumber,
      locale,
    })) ?? {}

  if (!title || !description || !articles) {
    notFound()
  }
  return (
    <>
      <JSONLD
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            url: 'https://nosgestesclimat.fr',
            name: 'Nos Gestes Climat',
            logo: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
          },
        ]}
      />

      <ContentLarge tag="div" className="overflow-hidden px-4 lg:px-0">
        {title && description && (
          <BlogHero
            title={title}
            description={description}
            image={
              image
                ? { url: image.url }
                : {
                    url: 'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_reading_newspaper_d171290d3d.png',
                  }
            }
          />
        )}

        {mainArticle && (
          <MainArticle
            locale={locale}
            title={mainArticle.title}
            description={mainArticle.description}
            imageSrc={mainArticle.image?.url ?? ''}
            href={`/blog/${mainArticle.blogCategory?.slug}/${mainArticle.slug}`}
            category={mainArticle.blogCategory?.title ?? ''}
          />
        )}

        {articles && (
          <ArticleList
            locale={locale}
            articles={articles}
            pageCount={pageCount ?? 0}
            currentPage={pageNumber}
          />
        )}
      </ContentLarge>

      <AllBlogCategories locale={locale} />

      <Footer backgroundColor="white" locale={locale} />
    </>
  )
}
