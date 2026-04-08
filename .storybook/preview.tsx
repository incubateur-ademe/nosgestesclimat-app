import type { Preview } from '@storybook/nextjs'
import i18next from 'i18next'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../src/app/[locale]/globals.css'
import '../src/design-system/marianne.css'
import '../src/locales/initClient'

// Initialize MSW for GitHub Pages
// Custom domain (storybook.nosgestesclimat.fr) serves from root,
// so no repository prefix is needed.
initialize({
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const locale = context.args.locale ?? 'fr'

      // Sync the NEXT_LOCALE cookie so useCurrentLocale() picks up the right locale
      document.cookie = `NEXT_LOCALE=${locale}; path=/`

      // Sync the i18next language so useTranslation / TransClient re-renders
      if (i18next.language !== locale) {
        i18next.changeLanguage(locale)
      }

      return Story()
    },
    (Story) => {
      // Apply the font-sans class and set the variable for Storybook
      return (
        <div className="font-sans" style={{ '--font-marianne': '"Marianne"' } as React.CSSProperties}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
