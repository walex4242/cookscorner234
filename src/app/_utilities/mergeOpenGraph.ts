import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  siteName: 'Cooks Corner',
  title: 'Restaurant',
  description: 'Order your meal and it will be delivered to you',
  images: [
    {
      url: 'https://cookscornernc.com/media/ied%20(1163x620%20px).png',
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
