import localFont from 'next/font/local'

export const marianne = localFont({
  src: [
    {
      path: '../../../public/fonts/Marianne-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/Marianne-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/Marianne-Regular.woff2',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/Marianne-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/Marianne-Bold.woff2',
      weight: 'bold',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/Marianne-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-marianne',
  display: 'swap',
  preload: true,
})
