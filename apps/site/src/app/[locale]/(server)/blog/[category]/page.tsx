import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'

import FAQ from '@/components/landing-pages/FAQ'
import ContentLarge from '@/components/layout/ContentLarge'
import Footer from '@/components/layout/Footer'
import AllBlogCategories from '@/design-system/cms/AllBlogCategories'
import ArticleList from '@/design-system/cms/ArticleList'
import MainArticle from '@/design-system/cms/MainArticle'
import { getDynamicPageTitleWithPagination } from '@/helpers/blog/getDynamicPageTitleWithPagination'
import { getPageNumber } from '@/helpers/blog/getPageNumber'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getShouldBeLocalised } from '@/helpers/language/getShouldBeLocalised'
import type { Locale } from '@/i18nConfig'
import i18nConfig from '@/i18nConfig'
import { fetchCategoryPageContent } from '@/services/cms/fetchCategoryPageContent'
import { fetchCategoryPageMetadata } from '@/services/cms/fetchCategoryPageMetadata'
import type { DefaultPageProps } from '@/types'
import type { SearchParams } from 'next/dist/server/request/search-params'
import { notFound, redirect } from 'next/navigation'
import AdditionalContent from './_components/AdditionalContent'
import CategoryHero from './_components/CategoryHero'
import CategoryJSONLD from './_components/CategoryJSONLD'

export async function generateMetadata({
  params,
  searchParams,
}: DefaultPageProps<{
  params: { category: string; locale: Locale }
  searchParams: Promise<SearchParams>
}>) {
  const { category, locale } = await params

  const { t } = await getServerTranslation({ locale })

  const pageNumber = await getPageNumber(searchParams)

  const { metaTitle, metaDescription, image, pageCount } =
    (await fetchCategoryPageMetadata({
      slug: category,
      locale,
      pageNumber,
    })) ?? {}

  const dynamicTitle = getDynamicPageTitleWithPagination({
    metaTitle,
    pageCount,
    pageNumber,
    t,
  })

  return getMetadataObject({
    locale,
    title:
      dynamicTitle ??
      t(
        'blog.homepage.defaultTitle',
        'Blog, découvrez nos articles et conseils sur le climat - Nos Gestes Climat'
      ),
    description:
      metaDescription ??
      t(
        'blog.homepage.defaultDescription',
        'Découvrez des conseils pratiques pour réduire votre empreinte écologique.'
      ),
    image: image?.url ?? '',
    alternates: {
      canonical: `/blog/${category}`,
    },
    locales: (await getShouldBeLocalised({ category }))
      ? [...i18nConfig.locales]
      : [i18nConfig.defaultLocale],
  })
}

export default async function CategoryPage({
  params,
  searchParams,
}: DefaultPageProps<{
  params: { category: string; locale: Locale }
  searchParams: { page: string }
}>) {
  const { category, locale } = await params

  const pageParam = searchParams ? (await searchParams).page : undefined

  // Get the page number from the query params from the server side
  const page = Number(pageParam) || 1

  const {
    title,
    description,
    mainArticle,
    articles,
    pageCount,
    faq,
    faqDescription,
    additionalContent,
    image,
  } =
    (await fetchCategoryPageContent({
      slug: category,
      page,
      locale,
    })) ?? {}

  //  Firstly redirect to french version if the page is not available in the current locale
  if (locale !== i18nConfig.defaultLocale && (!title || !description)) {
    return redirect(`/fr/blog/${category}`)
  }

  //  If the page is not available in the default locale, redirect to the not found page
  if (locale === i18nConfig.defaultLocale && (!title || !description)) {
    notFound()
  }

  if (!title || !description) {
    notFound()
  }

  const questions = faq?.questions ?? []

  return (
    <>
      <div>
        <CategoryJSONLD
          title={title}
          questions={questions}
          categorySlug={category}
        />

        <CategoryHero
          className="mt-0"
          title={title}
          description={description}
          slug={category}
        />

        <ContentLarge tag="div" className="overflow-hidden px-4 lg:px-0">
          {mainArticle && (
            <MainArticle
              imageSrc={mainArticle.image?.url ?? ''}
              title={mainArticle.title}
              description={mainArticle.description}
              category={title}
              href={`/blog/${category}/${mainArticle.slug}`}
              locale={locale}
            />
          )}

          {articles && articles.length > 0 && (
            <ArticleList
              articles={articles}
              pageCount={pageCount ?? 0}
              currentPage={page}
              locale={locale}
            />
          )}
        </ContentLarge>

        {questions.length > 0 && (
          <FAQ
            className="pb-10!"
            questions={questions.map((question) => ({
              question: question.question,
              answer: question.htmlAnswer,
            }))}
            subTitle={faqDescription}
            isBackgroundSkewed={false}
            shouldUseDangerouslySetInnerHTML={true}
            locale={locale}
          />
        )}

        {additionalContent && image && (
          <AdditionalContent
            content={additionalContent ?? ''}
            image={image ?? { url: '', alternativeText: '' }}
          />
        )}

        <AllBlogCategories
          className={
            (additionalContent && image) ||
            (!(additionalContent || image) && !questions?.length)
              ? 'before:bg-white'
              : 'before:bg-[#F6F6F5]'
          }
          locale={locale}
        />
      </div>

      <Footer backgroundColor="white" locale={locale} params={{ category }} />
    </>
  )
}
