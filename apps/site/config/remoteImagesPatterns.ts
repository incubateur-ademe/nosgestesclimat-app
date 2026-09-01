import type { RemotePattern } from 'next/dist/shared/lib/image-config'

export const remoteImagesPatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'abc-transitionbascarbone.fr',
    port: '',
    pathname: '/wp-content/uploads/**',
  },
  {
    protocol: 'https',
    hostname: 'upload.wikimedia.org',
    port: '',
    pathname: '/wikipedia/commons/**',
  },
  {
    protocol: 'https',
    hostname: 'user-images.githubusercontent.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'github.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'cdn.jsdelivr.net',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'nosgestesclimat-dev.s3.fr-par.scw.cloud',
    port: '',
    pathname: '/cms/**',
  },
  {
    protocol: 'https',
    hostname: 'nosgestesclimat-prod.s3.fr-par.scw.cloud',
    port: '',
    pathname: '/cms/**',
  },
  {
    protocol: 'https',
    hostname: 's3.fr-par.scw.cloud',
    port: '',
    pathname: '/nosgestesclimat-prod/cms/**',
  },
]
