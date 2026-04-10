// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import React from 'react'

// Tailles de texte Tailwind par défaut avec leurs équivalents en rem et px
const tailwindTextSizes = [
  { class: 'text-xs', rem: '0.75rem', px: '12px', description: 'Extra small' },
  { class: 'text-sm', rem: '0.875rem', px: '14px', description: 'Small' },
  {
    class: 'text-base',
    rem: '1rem',
    px: '16px',
    description: 'Base (default)',
  },
  { class: 'text-lg', rem: '1.125rem', px: '18px', description: 'Large' },
  { class: 'text-xl', rem: '1.25rem', px: '20px', description: 'Extra large' },
  { class: 'text-2xl', rem: '1.5rem', px: '24px', description: '2X Large' },
  { class: 'text-3xl', rem: '1.875rem', px: '30px', description: '3X Large' },
  { class: 'text-4xl', rem: '2.25rem', px: '36px', description: '4X Large' },
  { class: 'text-5xl', rem: '2.75rem', px: '44px', description: '5X Large' },
  { class: 'text-6xl', rem: '3.75rem', px: '60px', description: '6X Large' },
  { class: 'text-7xl', rem: '4.5rem', px: '72px', description: '7X Large' },
  { class: 'text-8xl', rem: '6rem', px: '96px', description: '8X Large' },
  { class: 'text-9xl', rem: '8rem', px: '128px', description: '9X Large' },
]

// Styles des balises h1-h6 définis dans globals.css
const headingStyles = [
  {
    tag: 'h1',
    mobileClass: 'text-2xl',
    desktopClass: 'md:text-3xl',
    mobileRem: '1.5rem',
    mobilePx: '24px',
    desktopRem: '1.875rem',
    desktopPx: '30px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-6',
    lineHeight: 'leading-tight',
  },
  {
    tag: 'h2',
    mobileClass: 'text-xl',
    desktopClass: 'md:text-2xl',
    mobileRem: '1.25rem',
    mobilePx: '20px',
    desktopRem: '1.5rem',
    desktopPx: '24px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-4',
    lineHeight: 'leading-tight',
  },
  {
    tag: 'h3',
    mobileClass: 'text-lg',
    desktopClass: 'md:text-xl',
    mobileRem: '1.125rem',
    mobilePx: '18px',
    desktopRem: '1.25rem',
    desktopPx: '20px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-4',
    lineHeight: 'leading-tight',
  },
  {
    tag: 'h4',
    mobileClass: 'text-base',
    desktopClass: 'md:text-lg',
    mobileRem: '1rem',
    mobilePx: '16px',
    desktopRem: '1.125rem',
    desktopPx: '18px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-4',
    lineHeight: 'leading-tight',
  },
  {
    tag: 'h5',
    mobileClass: 'text-base',
    desktopClass: 'md:text-lg',
    mobileRem: '1rem',
    mobilePx: '16px',
    desktopRem: '1.125rem',
    desktopPx: '18px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-4',
    lineHeight: 'leading-tight',
  },
  {
    tag: 'h6',
    mobileClass: 'text-base',
    desktopClass: 'md:text-lg',
    mobileRem: '1rem',
    mobilePx: '16px',
    desktopRem: '1.125rem',
    desktopPx: '18px',
    fontWeight: 'font-medium',
    marginBottom: 'mb-4',
    lineHeight: 'leading-tight',
  },
]

const TextSizeExample = ({
  className,
  rem,
  px,
  description,
  children,
}: {
  className: string
  rem: string
  px: string
  description: string
  children: React.ReactNode
}) => (
  <div className="mb-4 rounded-lg border border-gray-200 p-4">
    <div className={`${className} mb-2`}>{children}</div>
    <div className="space-y-1 text-sm text-gray-600">
      <div>
        <strong>Classe Tailwind:</strong> {className}
      </div>
      <div>
        <strong>Taille:</strong> {rem} ({px})
      </div>
      <div>
        <strong>Description:</strong> {description}
      </div>
    </div>
  </div>
)

const HeadingExample = ({
  tag,
  mobileClass,
  desktopClass,
  mobileRem,
  mobilePx,
  desktopRem,
  desktopPx,
  fontWeight,
  marginBottom,
  lineHeight,
}: {
  tag: string
  mobileClass: string
  desktopClass: string
  mobileRem: string
  mobilePx: string
  desktopRem: string
  desktopPx: string
  fontWeight: string
  marginBottom: string
  lineHeight: string
}) => {
  const Tag = tag as keyof React.JSX.IntrinsicElements
  return (
    <div className="mb-4 rounded-lg border border-gray-200 p-4">
      <Tag
        className={`${mobileClass} ${desktopClass} ${fontWeight} ${marginBottom} ${lineHeight}`}>
        Exemple de titre {tag.toUpperCase()}
      </Tag>
      <div className="space-y-1 text-sm text-gray-600">
        <div>
          <strong>Balise:</strong> &lt;{tag}&gt;
        </div>
        <div>
          <strong>Classes:</strong> {mobileClass} {desktopClass} {fontWeight}{' '}
          {marginBottom} {lineHeight}
        </div>
        <div>
          <strong>Mobile:</strong> {mobileRem} ({mobilePx})
        </div>
        <div>
          <strong>Desktop:</strong> {desktopRem} ({desktopPx})
        </div>
      </div>
    </div>
  )
}

const TextSizes = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-4xl font-bold">Tailles de texte</h1>

      {/* Section Tailwind */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">
          Tailles de texte Tailwind CSS
        </h2>
        <p className="mb-6 text-gray-600">
          Voici toutes les tailles de texte disponibles avec Tailwind CSS, avec
          leurs équivalents en rem et pixels.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tailwindTextSizes.map((size) => (
            <TextSizeExample
              key={size.class}
              className={size.class}
              rem={size.rem}
              px={size.px}
              description={size.description}>
              Exemple de texte {size.description.toLowerCase()}
            </TextSizeExample>
          ))}
        </div>
      </section>

      {/* Section Balises de titre */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Balises de titre (h1-h6)</h2>
        <p className="mb-6 text-gray-600">
          Styles spécifiques définis pour les balises de titre dans le fichier
          globals.css.
        </p>
        <div className="space-y-4">
          {headingStyles.map((heading) => (
            <HeadingExample
              key={heading.tag}
              tag={heading.tag}
              mobileClass={heading.mobileClass}
              desktopClass={heading.desktopClass}
              mobileRem={heading.mobileRem}
              mobilePx={heading.mobilePx}
              desktopRem={heading.desktopRem}
              desktopPx={heading.desktopPx}
              fontWeight={heading.fontWeight}
              marginBottom={heading.marginBottom}
              lineHeight={heading.lineHeight}
            />
          ))}
        </div>
      </section>

      {/* Section Utilisation */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Guide d'utilisation</h2>
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-semibold">
            Quand utiliser chaque taille :
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>text-xs (12px) :</strong> Labels, badges, annotations
            </li>
            <li>
              <strong>text-sm (14px) :</strong> Textes secondaires, légendes
            </li>
            <li>
              <strong>text-base (16px) :</strong> Texte principal, paragraphes
            </li>
            <li>
              <strong>text-lg (18px) :</strong> Sous-titres, textes importants
            </li>
            <li>
              <strong>text-xl (20px) :</strong> Titres de section
            </li>
            <li>
              <strong>text-2xl (24px) :</strong> Titres principaux
            </li>
            <li>
              <strong>text-3xl+ (30px+) :</strong> Titres de page, hero
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}

const meta: Meta<typeof TextSizes> = {
  title: 'Design System/Docs/TextSizes',
  component: TextSizes,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof TextSizes>

export const Default: Story = {}
